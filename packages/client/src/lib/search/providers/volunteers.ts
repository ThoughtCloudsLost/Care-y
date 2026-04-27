/**
 * Volunteer search provider. Admin/manager-only. Lazy-fetches admin
 * users on first search, stores in a reactive SvelteMap cache, then
 * decrypts display names and fuzzy matches client-side.
 *
 * Scale is <50 users, no fullSearch needed.
 *
 * Results rendered as UserCard grid cards in a horizontal card-strip.
 * Result tap navigates to /admin/people?user={id}.
 */
import { SvelteMap } from "svelte/reactivity";
import type { SearchProvider, SearchResult } from "../types.js";
import type { Component } from "svelte";
import { fuzzySearch } from "../fuzzy.js";
import { UsersRound } from "@lucide/svelte";
import * as m from "$lib/paraglide/messages.js";
import VolunteerResultItem from "$lib/components/search/VolunteerResultItem.svelte";

/** Raw admin user record from the TanStack Query cache (listUsers response). */
export interface RawAdminUser {
  readonly id: string;
  readonly encryptedDisplayName: unknown;
  readonly roleId: string;
  readonly isActive: boolean;
  readonly hasKeys: boolean;
  readonly hasOrgKeyWrap: boolean;
}

/** Display-ready data passed to VolunteerResultItem. */
export interface VolunteerSearchData {
  readonly userId: string;
  readonly displayName: string | null;
  readonly roleId: string;
  readonly isActive: boolean;
  readonly hasKeys: boolean;
  readonly hasOrgKeyWrap: boolean;
  readonly isSelf: boolean;
}

/** Dependency injection for testability. */
export interface VolunteerSearchProviderDeps {
  /** Fetch admin users (from TanStack cache or server). */
  readonly fetchUsers: () => Promise<readonly RawAdminUser[]>;
  /** Decrypt a display name via OrgDecryptCache. Returns plaintext or null. */
  readonly decryptDisplayName: (
    userId: string,
    ciphertext: unknown,
  ) => string | null;
  /** Current user ID, so the card can show "you" indicator. */
  readonly currentUserId: () => string | undefined;
}

export function createVolunteerSearchProvider(
  deps: VolunteerSearchProviderDeps,
): SearchProvider<VolunteerSearchData> {
  const cache = new SvelteMap<string, RawAdminUser>();
  let loaded = false;
  let loading = false;

  async function loadAll(): Promise<void> {
    if (loaded || loading) return;
    loading = true;
    try {
      const users = await deps.fetchUsers();
      for (const user of users) {
        cache.set(user.id, user);
      }
      loaded = true;
    } finally {
      loading = false;
    }
  }

  return {
    id: "volunteers",
    label: () => m.search_section_volunteers(),
    icon: UsersRound as Component,
    renderMode: "card-strip",
    showAllHref: (query) =>
      `/admin/people?tab=users&q=${encodeURIComponent(query)}`,
    getResultHref: (id) => `/admin/people?user=${id}`,

    search(query) {
      if (!loaded && !loading) void loadAll();
      if (cache.size === 0) {
        return { results: [], loading, totalCached: 0 };
      }

      // Decrypt display names into parallel arrays for fuzzy search.
      const ids: string[] = [];
      const names: string[] = [];
      const nameMap = new Map<string, string | null>();

      for (const [id, user] of cache) {
        const name = deps.decryptDisplayName(id, user.encryptedDisplayName);
        nameMap.set(id, name);
        ids.push(id);
        names.push(name ?? "");
      }

      const matches = fuzzySearch(names, query);
      const currentId = deps.currentUserId();
      const results: SearchResult<VolunteerSearchData>[] = [];

      for (const match of matches) {
        const id = ids[match.index];
        if (id === undefined) continue;
        const user = cache.get(id);
        if (user === undefined) continue;

        results.push({
          id,
          data: {
            userId: user.id,
            displayName: nameMap.get(user.id) ?? null,
            roleId: user.roleId,
            isActive: user.isActive,
            hasKeys: user.hasKeys,
            hasOrgKeyWrap: user.hasOrgKeyWrap,
            isSelf: user.id === currentId,
          },
        });
      }

      return {
        results,
        loading: false,
        totalCached: cache.size,
      };
    },

    ResultItem: VolunteerResultItem as Component<{
      result: VolunteerSearchData;
      ontap: (id: string) => void;
    }>,
  };
}
