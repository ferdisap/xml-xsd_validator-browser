import {
  xmlRegisterInputProvider,
  xmlCleanupInputProvider,
} from 'libxml2-wasm'; // impor dari package utama

// types from libxml2-wasm (jika perlu), atau declare minimal:
type XmlInputProvider = {
  match(filename: string): boolean;
  open(filename: string): number | undefined;
  read(fd: number, buf: Uint8Array): number;
  close(fd: number): boolean;
};

/**
 * Virtual file provider for libxml2-wasm. Handles in-memory XSDs.
 * When libxml2 fetch the import xsd, libxml2 will get the xsd text from this class.
 * This will avoid error Uncaught (in promise) Error: failed to load 'schema.xsd' from xs:import or other
 */
export class MapInputProvider implements XmlInputProvider {
  // key -> Uint8Array(contents)
  private store: Map<string, Uint8Array>;
  // fd -> { pos, bytes }
  private handles = new Map<number, { pos: number; data: Uint8Array }>();
  private nextFd = 1;

  constructor(map: Map<string, string> | Array<{ filename: string; contents: string }>) {
    this.store = new Map();
    if (map instanceof Map) {
      for (const [k, v] of map.entries()) {
        this.store.set(this.normalizeKey(k), this.toUint8(v));
      }
    } else {
      for (const item of map) {
        this.store.set(this.normalizeKey(item.filename), this.toUint8(item.contents));
      }
    }
    // Also add basename entries for convenience
    for (const key of Array.from(this.store.keys())) {
      const base = this.basename(key);
      if (!this.store.has(base)) {
        this.store.set(base, this.store.get(key)!);
      }
    }
  }

  // Normalize keys so matching is flexible: strip trailing slashes, lower-case protocol, etc.
  private normalizeKey(k: string) {
    if (!k) return k;
    try {
      // try to make an absolute url normalized
      const u = new URL(k);
      return u.href;
    } catch {
      // fallback: return path as-is
      return k;
    }
  }
  private basename(path: string) {
    try {
      const u = new URL(path);
      return u.pathname.split('/').pop() || path;
    } catch {
      // fallback to last segment
      const parts = path.split('/');
      return parts[parts.length - 1] || path;
    }
  }

  private toUint8(s: string) {
    return new TextEncoder().encode(s);
  }

  // === XmlInputProvider impl ===

  match(filename: string): boolean {
    if (!filename) return false;
    const n = this.normalizeKey(filename);
    if (this.store.has(n)) return true;
    const base = this.basename(n);
    if (this.store.has(base)) return true;
    // try more loose matching: some callers may pass relative paths or full urls without protocol
    // try endsWith on keys
    for (const k of this.store.keys()) {
      if (n.endsWith(k) || k.endsWith(n)) return true;
    }
    return false;
  }

  open(filename: string): number | undefined {
    const n = this.normalizeKey(filename);
    let data = this.store.get(n);
    if (!data) {
      const base = this.basename(n);
      data = this.store.get(base);
    }
    if (!data) {
      // attempt endsWith match
      for (const [k, v] of this.store.entries()) {
        if (n.endsWith(k) || k.endsWith(n)) {
          data = v;
          break;
        }
      }
    }
    if (!data) return undefined; // libxml2 considers 0 as failure

    const fd = this.nextFd++;
    this.handles.set(fd, { pos: 0, data });
    return fd; // must be non-zero
  }

  read(fd: number, buf: Uint8Array): number {
    const h = this.handles.get(fd);
    if (!h) return -1; // error
    const remaining = h.data.length - h.pos;
    if (remaining <= 0) return 0; // EOF
    const toCopy = Math.min(buf.byteLength, remaining);
    buf.set(h.data.subarray(h.pos, h.pos + toCopy), 0);
    h.pos += toCopy;
    return toCopy;
  }

  close(fd: number): boolean {
    const ok = this.handles.delete(fd);
    return ok;
  }

  // utility: register provider at libxml2
  register() {
    return xmlRegisterInputProvider(this as unknown as any);
  }

  cleanup() {
    xmlCleanupInputProvider();
  }
}