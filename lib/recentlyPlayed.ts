export type RecentlyPlayedItem = {
  surahId: number;
  surahNameEn: string;
  reciterId: string;
  reciterName: string;
  audioPath: string;
  playedAt: number; // Date.now()
};

const KEY = "qg_recently_played_v1";

export function addRecentlyPlayed(item: RecentlyPlayedItem) {
  try {
    const existing = getRecentlyPlayed();

    // remove duplicates (same reciter + surah)
    const filtered = existing.filter(
      (x) => !(x.surahId === item.surahId && x.reciterId === item.reciterId)
    );

    // put newest on top
    const next = [item, ...filtered].slice(0, 30); // keep last 30
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getRecentlyPlayed(): RecentlyPlayedItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearRecentlyPlayed() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
