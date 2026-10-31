export function displayElapsedSeconds(
  elapsedSeconds: number,
  visibleStartedAt: string | null,
  now: Date = new Date(),
): number {
  if (visibleStartedAt === null) {
    return elapsedSeconds;
  }
  const startedMs = Date.parse(visibleStartedAt);
  if (Number.isNaN(startedMs)) {
    return elapsedSeconds;
  }
  const extraSeconds = Math.max(0, Math.floor((now.getTime() - startedMs) / 1000));
  return elapsedSeconds + extraSeconds;
}
