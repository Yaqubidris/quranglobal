export type Reciter = {
  id: number;
  name: string;
  country: string;
  region: string;
};

export type Surah = {
  id: number;
  name_en: string;
  name_ar: string | null;
};

export type UploadRow = {
  id: number;
  created_at: string;
  reciter_id: number;
  surah_id: number;
  audio_path: string;

  // ✅ singular objects (because we select using aliases)
  reciter?: { name: string } | null;
  surah?: { name_en: string; name_ar: string | null } | null;
};
