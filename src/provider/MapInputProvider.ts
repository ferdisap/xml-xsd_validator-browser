import { xmlCleanupInputProvider, xmlRegisterInputProvider } from "libxml2-wasm";
import { useLibXml2 } from "../libxml/libxmlloader.js";
import { MapInputProvider, Schema } from "../types/types.js";

/**
 * Create a virtual file provider for libxml2-wasm.
 * It maps filenames (or URLs) to in-memory schema contents,
 * allowing libxml2 to resolve xs:import/xs:include directly
 * without needing network access.
 */
export async function createMapInputProvider(map: Map<string, string> | Array<Schema>) :Promise<MapInputProvider> {
  const store = new Map<string, Uint8Array>();
  const handles = new Map<number, { pos: number; data: Uint8Array }>();
  let nextFd = 1;

  // --- utilities ---
  const toUint8 = (s: string) => new TextEncoder().encode(s);

  const normalizeKey = (k: string) => {
    if (!k) return k;
    try {
      const u = new URL(k);
      return u.href;
    } catch {
      return k;
    }
  };

  const basename = (path: string) => {
    try {
      const u = new URL(path);
      return u.pathname.split("/").pop() || path;
    } catch {
      const parts = path.split("/");
      return parts[parts.length - 1] || path;
    }
  };

  // --- initialize store ---
  if (map instanceof Map) {
    for (const [k, v] of map.entries()) store.set(normalizeKey(k), toUint8(v));
  } else {
    for (const { filename, contents } of map)
      store.set(normalizeKey(filename), toUint8(contents));
  }

  // Also add basenames for fallback
  for (const key of Array.from(store.keys())) {
    const base = basename(key);
    if (!store.has(base)) {
      store.set(base, store.get(key)!);
    }
  }

  // --- provider implementation ---
  const match = (filename: string): boolean => {
    if (!filename) return false;
    const n = normalizeKey(filename);
    if (store.has(n)) return true;
    const base = basename(n);
    if (store.has(base)) return true;
    for (const k of store.keys()) {
      if (n.endsWith(k) || k.endsWith(n)) return true;
    }
    return false;
  };

  const open = (filename: string): number | undefined => {
    const n = normalizeKey(filename);
    let data = store.get(n);
    if (!data) {
      const base = basename(n);
      data = store.get(base);
    }
    if (!data) {
      for (const [k, v] of store.entries()) {
        if (n.endsWith(k) || k.endsWith(n)) {
          data = v;
          break;
        }
      }
    }
    if (!data) return undefined;
    const fd = nextFd++;
    handles.set(fd, { pos: 0, data });
    return fd;
  };

  const read = (fd: number, buf: Uint8Array): number => {
    const h = handles.get(fd);
    if (!h) return -1;
    const remaining = h.data.length - h.pos;
    if (remaining <= 0) return 0;
    const toCopy = Math.min(buf.byteLength, remaining);
    buf.set(h.data.subarray(h.pos, h.pos + toCopy), 0);
    h.pos += toCopy;
    return toCopy;
  };

  const close = (fd: number): boolean => handles.delete(fd);

  // --- register / cleanup ---
  const register = () => {
    return xmlRegisterInputProvider({
      match,
      open,
      read,
      close,
    } as any);
  };

  const cleanup = () => {
    xmlCleanupInputProvider();
  };

  // expose methods
  return {
    match,
    open,
    read,
    close,
    register,
    cleanup,
  };
}

// #####

// export async function createMapInputProvider(map: Map<string, string> | Array<Schema>) :Promise<MapInputProvider> {
//   const { libxml, ensureLibxmlLoaded } = useLibXml2();

//   await ensureLibxmlLoaded()

//   const xmlRegisterInputProvider = libxml().xmlRegisterInputProvider;
//   const xmlCleanupInputProvider = libxml().xmlCleanupInputProvider;

//   const store = new Map<string, Uint8Array>();
//   const handles = new Map<number, { pos: number; data: Uint8Array }>();
//   let nextFd = 1;

//   // --- utilities ---
//   const toUint8 = (s: string) => new TextEncoder().encode(s);

//   const normalizeKey = (k: string) => {
//     if (!k) return k;
//     try {
//       const u = new URL(k);
//       return u.href;
//     } catch {
//       return k;
//     }
//   };

//   const basename = (path: string) => {
//     try {
//       const u = new URL(path);
//       return u.pathname.split("/").pop() || path;
//     } catch {
//       const parts = path.split("/");
//       return parts[parts.length - 1] || path;
//     }
//   };

//   // --- initialize store ---
//   if (map instanceof Map) {
//     for (const [k, v] of map.entries()) store.set(normalizeKey(k), toUint8(v));
//   } else {
//     for (const { filename, contents } of map)
//       store.set(normalizeKey(filename), toUint8(contents));
//   }

//   // Also add basenames for fallback
//   for (const key of Array.from(store.keys())) {
//     const base = basename(key);
//     if (!store.has(base)) {
//       store.set(base, store.get(key)!);
//     }
//   }

//   // --- provider implementation ---
//   const match = (filename: string): boolean => {
//     if (!filename) return false;
//     const n = normalizeKey(filename);
//     if (store.has(n)) return true;
//     const base = basename(n);
//     if (store.has(base)) return true;
//     for (const k of store.keys()) {
//       if (n.endsWith(k) || k.endsWith(n)) return true;
//     }
//     return false;
//   };

//   const open = (filename: string): number | undefined => {
//     const n = normalizeKey(filename);
//     let data = store.get(n);
//     if (!data) {
//       const base = basename(n);
//       data = store.get(base);
//     }
//     if (!data) {
//       for (const [k, v] of store.entries()) {
//         if (n.endsWith(k) || k.endsWith(n)) {
//           data = v;
//           break;
//         }
//       }
//     }
//     if (!data) return undefined;
//     const fd = nextFd++;
//     handles.set(fd, { pos: 0, data });
//     return fd;
//   };

//   const read = (fd: number, buf: Uint8Array): number => {
//     const h = handles.get(fd);
//     if (!h) return -1;
//     const remaining = h.data.length - h.pos;
//     if (remaining <= 0) return 0;
//     const toCopy = Math.min(buf.byteLength, remaining);
//     buf.set(h.data.subarray(h.pos, h.pos + toCopy), 0);
//     h.pos += toCopy;
//     return toCopy;
//   };

//   const close = (fd: number): boolean => handles.delete(fd);

//   // --- register / cleanup ---
//   const register = () => {
//     return xmlRegisterInputProvider({
//       match,
//       open,
//       read,
//       close,
//     } as any);
//   };

//   const cleanup = () => {
//     xmlCleanupInputProvider();
//   };

//   // expose methods
//   return {
//     match,
//     open,
//     read,
//     close,
//     register,
//     cleanup,
//   };
// }
