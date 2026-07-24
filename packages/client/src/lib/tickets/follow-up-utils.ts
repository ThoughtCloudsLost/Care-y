import { CONTENT_TYPE_REGISTRY, type ContentCategory } from "@care-y/shared";
import type { ContentTypeMeta } from "@care-y/shared";

const registry: Readonly<Record<string, ContentTypeMeta | undefined>> =
  CONTENT_TYPE_REGISTRY;

export function followUpKind(fu: { type: string }): ContentCategory {
  return registry[fu.type]?.category ?? "message";
}

// --- F6 grouping ---

export interface FollowUpGroup<T> {
  readonly grouped: true;
  readonly type: string;
  readonly count: number;
  readonly items: readonly T[];
  readonly firstTimestamp: string;
  readonly lastTimestamp: string;
}

export type GroupedFollowUp<T> = T | FollowUpGroup<T>;

export function isFollowUpGroup<T>(
  item: GroupedFollowUp<T>,
): item is FollowUpGroup<T> {
  return typeof item === "object" && item !== null && "grouped" in item;
}

export function followUpGroupKey<T extends { id: string }>(
  entry: GroupedFollowUp<T>,
): string {
  if (isFollowUpGroup(entry)) {
    const first = entry.items[0];
    return first !== undefined ? `group-${first.id}` : "group-unknown";
  }
  return entry.id;
}

const TEN_MINUTES_MS = 600_000;

function isGroupable(type: string): boolean {
  // eslint-disable-next-line security/detect-object-injection -- type comes from FollowUpType enum values, not user input
  const meta = registry[type];
  return meta !== undefined && meta.groupable && !meta.hasEventParams;
}

export function groupConsecutive<T extends { type: string; createdAt: string }>(
  followUps: readonly T[],
): readonly GroupedFollowUp<T>[] {
  if (followUps.length === 0) return [];

  const result: GroupedFollowUp<T>[] = [];
  let i = 0;

  while (i < followUps.length) {
    // eslint-disable-next-line security/detect-object-injection -- i is a loop counter bounded by followUps.length
    const current = followUps[i];
    if (current === undefined) break;

    if (!isGroupable(current.type)) {
      result.push(current);
      i++;
      continue;
    }

    const run: T[] = [current];
    let j = i + 1;

    while (j < followUps.length) {
      // eslint-disable-next-line security/detect-object-injection -- j is a loop counter bounded by followUps.length
      const next = followUps[j];
      if (next?.type !== current.type) break;

      const prev = run.at(-1);
      if (!prev) break;
      const gap = Math.abs(
        Date.parse(next.createdAt) - Date.parse(prev.createdAt),
      );
      if (gap > TEN_MINUTES_MS) break;

      run.push(next);
      j++;
    }

    if (run.length === 1) {
      result.push(current);
    } else {
      const first = run[0];
      const last = run[run.length - 1];
      if (first !== undefined && last !== undefined) {
        result.push({
          grouped: true,
          type: current.type,
          count: run.length,
          items: run,
          firstTimestamp: first.createdAt,
          lastTimestamp: last.createdAt,
        });
      }
    }

    i = j;
  }

  return result;
}
