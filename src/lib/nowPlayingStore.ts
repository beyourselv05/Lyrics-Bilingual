type ReportedTrack = {
  title: string;
  artist: string;
  reportedAt: number;
};

let current: ReportedTrack | null = null;

export function setReportedTrack(title: string, artist: string) {
  current = { title, artist, reportedAt: Date.now() };
}

export function getReportedTrack(maxAgeMs: number): ReportedTrack | null {
  if (!current) return null;
  if (Date.now() - current.reportedAt > maxAgeMs) return null;
  return current;
}
