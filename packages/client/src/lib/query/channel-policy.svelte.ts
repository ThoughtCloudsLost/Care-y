/**
 * Volunteer-side channel policy query.
 *
 * Returns the org's channel policy with all channels defaulting to true
 * while the query loads. Uses a long stale time (5 min) since the policy
 * changes infrequently. The admin section invalidates the same key on
 * mutation success, so an admin who also has the detail view open sees
 * the change immediately.
 */

import { createQuery, type CreateQueryResult } from "@tanstack/svelte-query";
import type { ChannelPolicy } from "@care-y/shared";
import { trpc } from "$lib/trpc/index.js";
import { adminKeys } from "$lib/query/keys.js";
import { requireRouter } from "$lib/errors.js";

const POLICY_DEFAULTS: ChannelPolicy = {
  smsEnabled: true,
  emailEnabled: true,
  secureLinkEnabled: true,
  voiceEnabled: true,
  shareLinkEnabled: true,
};

export interface ResolvedChannelPolicy {
  readonly query: CreateQueryResult<ChannelPolicy>;
  readonly smsEnabled: boolean;
  readonly emailEnabled: boolean;
  readonly secureLinkEnabled: boolean;
  readonly voiceEnabled: boolean;
  readonly shareLinkEnabled: boolean;
}

/**
 * Creates a channel policy query with safe defaults. Call at the top
 * of a component script block (requires Svelte 5 reactivity context).
 */
export function createChannelPolicyQuery(): ResolvedChannelPolicy {
  const orgRouter = requireRouter(trpc.org, "org");
  const query = createQuery(() => ({
    queryKey: adminKeys.channelPolicy(),
    queryFn: async (): Promise<ChannelPolicy> =>
      orgRouter.getChannelPolicy.query(),
    staleTime: 5 * 60 * 1000,
  }));

  const resolved: ResolvedChannelPolicy = {
    get query() {
      return query;
    },
    get smsEnabled() {
      return query.data?.smsEnabled ?? POLICY_DEFAULTS.smsEnabled;
    },
    get emailEnabled() {
      return query.data?.emailEnabled ?? POLICY_DEFAULTS.emailEnabled;
    },
    get secureLinkEnabled() {
      return query.data?.secureLinkEnabled ?? POLICY_DEFAULTS.secureLinkEnabled;
    },
    get voiceEnabled() {
      return query.data?.voiceEnabled ?? POLICY_DEFAULTS.voiceEnabled;
    },
    get shareLinkEnabled() {
      return query.data?.shareLinkEnabled ?? POLICY_DEFAULTS.shareLinkEnabled;
    },
  };

  return resolved;
}
