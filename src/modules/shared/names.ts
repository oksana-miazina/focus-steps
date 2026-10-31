export function trimName(name: string): string {
  return name.trim();
}

export function isBlankName(name: string): boolean {
  return trimName(name) === "";
}
