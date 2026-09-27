export type Profile = { institution: string; year: string; programId: string; moduleIds: string[]; examDates?: Record<string, string> };

export const profileKey = 'revisionos:profile';

export function loadProfile(): Profile | null {
  try {
    const saved = window.localStorage.getItem(profileKey);
    return saved ? JSON.parse(saved) as Profile : null;
  } catch { return null; }
}

export function saveProfile(profile: Profile): void {
  window.localStorage.setItem(profileKey, JSON.stringify(profile));
}

export function examDateFor(moduleId: string): string | null {
  return loadProfile()?.examDates?.[moduleId] || null;
}

export function setExamDate(moduleId: string, date: string): void {
  const profile = loadProfile() ?? { institution: '', year: '', programId: '', moduleIds: [moduleId] };
  const examDates = { ...profile.examDates };
  if (date) examDates[moduleId] = date; else delete examDates[moduleId];
  saveProfile({ ...profile, examDates });
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const target = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(target.valueOf())) return null;
  return Math.max(0, Math.ceil((target.valueOf() - Date.now()) / 86_400_000));
}

export function roadmapUrl(moduleId: string): string {
  const date = examDateFor(moduleId);
  return `/api/modules/${moduleId}/roadmap${date ? `?examDate=${date}` : ''}`;
}

export function masteredFor(moduleId: string): Set<string> {
  try { return new Set((JSON.parse(window.localStorage.getItem(`revisionos:qwen:${moduleId}`) ?? '{}') as { mastered?: string[] }).mastered ?? []); }
  catch { return new Set(); }
}

export function countdownLabel(days: number | null): string {
  if (days === null) return 'No exam date';
  if (days === 0) return 'Exam today';
  return days === 1 ? 'Exam tomorrow' : `Exam in ${days} days`;
}
