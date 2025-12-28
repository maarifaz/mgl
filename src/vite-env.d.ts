/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_KEY: string;
  // Gələcəkdə başqa .env dəyişənləri olsa, bura əlavə edəcəksən
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
