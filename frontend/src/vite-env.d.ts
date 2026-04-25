/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When set, API calls are prefixed (omit for same-origin + Vite proxy) */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
