export interface MentionInsertResult {
  readonly text: string;
  readonly cursor: number;
}

export function shouldShowHint(type: string, shownSet: Set<string>): boolean {
  if (shownSet.has(type)) return false;
  shownSet.add(type);
  return true;
}

export interface DecryptCache {
  readonly get: (id: string) => string | undefined;
}

export function searchFollowUps(
  followUps: readonly { readonly id: string }[],
  cache: DecryptCache,
  searchTerm: string,
  errorSentinel: string,
  fuzzySearchFn: (
    haystack: readonly string[],
    query: string,
  ) => readonly { readonly index: number }[],
): string[] {
  const searchable: { id: string; plaintext: string }[] = [];
  for (const fu of followUps) {
    const plaintext = cache.get(fu.id);
    if (plaintext === undefined || plaintext === errorSentinel) continue;
    searchable.push({ id: fu.id, plaintext });
  }
  const haystack = searchable.map((e) => e.plaintext);
  const matches = fuzzySearchFn(haystack, searchTerm);
  const indices = matches.map((m) => m.index);
  indices.sort((a, b) => a - b);
  const ids: string[] = [];
  for (const idx of indices) {
    const entry = searchable[idx]; // eslint-disable-line security/detect-object-injection -- idx from fuzzySearchFn, bounded by haystack.length
    if (entry != null) ids.push(entry.id);
  }
  return ids;
}

export interface CachedTicketPage {
  readonly pages: readonly (readonly {
    readonly id: string;
    readonly followUpCount: number;
  }[])[];
}

export function lookupCachedFollowUpCount(
  entries: readonly [unknown, CachedTicketPage | undefined][],
  ticketId: string,
): number | undefined {
  for (const [, data] of entries) {
    if (!data?.pages) continue;
    for (const page of data.pages) {
      const match = page.find((t) => t.id === ticketId);
      if (match) return match.followUpCount;
    }
  }
  return undefined;
}

export function insertMentionAtCursor(
  draftText: string,
  cursorPosition: number,
  displayName: string,
): MentionInsertResult | null {
  const before = draftText.slice(0, cursorPosition);
  const after = draftText.slice(cursorPosition);
  const atIndex = before.lastIndexOf("@");
  if (atIndex === -1) return null;
  const replacement = `@${displayName} `;
  return {
    text: before.slice(0, atIndex) + replacement + after,
    cursor: atIndex + replacement.length,
  };
}
