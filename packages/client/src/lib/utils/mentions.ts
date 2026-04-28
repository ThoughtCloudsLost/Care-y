/** Extract @mention pseudonyms from text. */
export function extractMentions(text: string): string[] {
  const results: string[] = [];
  for (const match of text.matchAll(/@(\w+)/g)) {
    if (match[1] !== undefined) results.push(match[1]);
  }
  return results;
}
