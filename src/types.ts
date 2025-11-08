/**
 * Status sederhana worker.
 * `true` berarti xml valid, `false` berarti xml tidak valid.
 */
export type SimpleWorkerStatus = boolean;

/**
 * Kumpulan hasil validasi dari proses worker.
 */
export type WorkerBags = ValidationInfo[];

/**
 * 🔹 Struktur data yang dikirim dari worker ke thread utama.
 */
export type WorkerResponse = { 
  /** ID unik (UUID) untuk payload yang sedang diproses */
  id: PayloadId;

  /** Status dari proses validasi */
  status: ValidationResponse["status"];

  /** Kumpulan hasil validasi */
  bags: ValidationResponse["bags"];
};

/**
 * 🔹 Payload yang dikirim ke worker untuk diproses.
 * @template TData Data spesifik yang dikirim ke worker.
 */
export type WorkerPayload<TData extends Record<string, any>> = {
  /** ID unik (UUID) payload */
  id: PayloadId;

  /** Isi data aktual yang akan diproses oleh worker */
  payload: TData;
};

/**
 * 🔹 Interface utama untuk menggunakan worker di sisi main thread.
 */
export type UseWorker = {
  /**
   * Jalankan proses validasi XML terhadap XSD.
   * @param xmlText Teks XML yang akan divalidasi.
   * @param mainSchemaUrl URL XSD utama (boleh `null`).
   * @param stopOnFailure Jika `true`, hentikan saat error pertama ditemukan.
   * @returns Promise yang mengembalikan hasil berupa `WorkerResponse`.
   */
  validate(xmlText: string, mainSchemaUrl: string | null, stopOnFailure?: boolean): Promise<WorkerResponse>;

  /**
   * Terminasi worker agar berhenti bekerja dan melepaskan resource.
   */
  terminate(): void;
};

/**
 * 🔹 Jenis-jenis nama error yang mungkin muncul selama validasi XML.
 */
export type ErrorName =
  | "FetchError"
  | "XSDValidatorParseError"
  | "XMLParseError"
  | "UnknownError"
  | "XMLValidateError"
  | "ParseTimeout"
  | "LibInitError"
  | "RegisteringProviderError";

/**
 * 🔹 Jenis validasi XML yang sedang dilakukan.
 */
export type ValidationType = "xsd" | "dtd" | "form" | "none";

/**
 * 🔹 Informasi detail tentang satu hasil error atau validasi.
 */
export type ValidationInfo = {
  /** Nama atau kategori error */
  name: ErrorName;

  /** Jenis validasi yang dilakukan */
  type: ValidationType;

  /** Detail pesan error dan posisi sumber */
  detail: {
    /** Pesan kesalahan */
    message: string;

    /** Nama file atau sumber XML */
    file: string;

    /** Nomor baris terjadinya error */
    line: number;

    /** Nomor kolom terjadinya error */
    col: number;
  };
}

/**
 * 🔹 Respons hasil proses validasi XML.
 */
export type ValidationResponse = {
  /** Status sederhana (`true` untuk sukses, `false` untuk gagal) */
  status: SimpleWorkerStatus;

  /** Daftar informasi validasi */
  bags: WorkerBags;
};

/**
 * 🔹 ID unik untuk payload.
 */
export type PayloadId = string;

/**
 * 🔹 Payload untuk menjalankan validasi XML terhadap XSD.
 */
export type ValidationPayload = {
  /** Teks XML yang akan divalidasi */
  xmlText: string;

  /** Lama waktu eksekusi (opsional) */
  duration?: number;

  /** Jika `true`, hentikan pada error pertama */
  stopOnFailure?: boolean;

  /** URL XSD utama (opsional) */
  mainSchemaUrl?: string | null;
};

/**
 * 🔹 Representasi satu schema XSD yang diunduh/digunakan.
 */
export type Schema = {
  /** Nama atau URL file schema */
  filename: string;

  /** Isi schema XSD dalam bentuk teks */
  contents: string;
};

/**
 * 🔹 Input provider untuk proses validasi XML.
 * Menyediakan akses virtual terhadap file yang dibaca oleh `libxml2-wasm`.
 */
export type MapInputProvider = {
  /**
   * Tentukan apakah provider ini menangani file tertentu.
   * @param filename Nama file yang ingin dicek.
   * @returns `true` jika provider akan menangani file tersebut.
   */
  match(filename: string): boolean;

  /**
   * Membuka file dan mengembalikan file descriptor.
   * @param filename Nama file.
   * @returns Nomor descriptor, atau `undefined` jika gagal.
   */
  open(filename: string): number | undefined;

  /**
   * Membaca isi file berdasarkan descriptor.
   * @param fd File descriptor.
   * @param buf Buffer target pembacaan.
   * @returns Jumlah byte yang berhasil dibaca, `-1` jika gagal.
   */
  read(fd: number, buf: Uint8Array): number;

  /**
   * Menutup file descriptor.
   * @param fd File descriptor.
   * @returns `true` jika berhasil menutup.
   */
  close(fd: number): boolean;

  /**
   * Registrasi provider ini ke dalam sistem libxml2 virtual IO.
   */
  register(): any;

  /**
   * Bersihkan provider dari sistem libxml2.
   */
  cleanup(): void;
};
