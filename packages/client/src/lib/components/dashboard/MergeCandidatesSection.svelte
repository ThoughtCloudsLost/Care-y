<script lang="ts">
  import { List, ListItem, Button, Chip, Block } from "konsta/svelte";
  import { GitMerge } from "@lucide/svelte";
  import CollapsibleSection from "./CollapsibleSection.svelte";
  import type { MergeCandidate } from "$lib/workers/crypto-protocol.js";
  import * as m from "$lib/paraglide/messages.js";

  interface MergeCandidatesSectionProps {
    candidates: readonly MergeCandidate[];
    expanded: boolean;
    ontoggle: () => void;
    /** Resolve client alias from the org decrypt cache. */
    resolveAlias: (clientId: string) => string | null;
    ondismiss: (clientIdA: string, clientIdB: string) => void;
    onreview: (clientIdA: string, clientIdB: string) => void;
  }

  let {
    candidates,
    expanded,
    ontoggle,
    resolveAlias,
    ondismiss,
    onreview,
  }: MergeCandidatesSectionProps = $props();

  function matchLabel(kind: "phone" | "email"): string {
    return kind === "phone"
      ? m.mergeCandidates_match_phone()
      : m.mergeCandidates_match_email();
  }
</script>

<CollapsibleSection
  id="merge-candidates"
  heading={m.mergeCandidates_heading()}
  count={candidates.length}
  icon={GitMerge}
  iconColor="var(--care)"
  {expanded}
  {ontoggle}
>
  <Block class="merge-candidates-notice">
    <p class="notice-text">{m.mergeCandidates_coverage_notice()}</p>
  </Block>
  <List strong inset>
    {#each candidates as candidate (candidate.clientIdA + ":" + candidate.clientIdB)}
      {@const aliasA = resolveAlias(candidate.clientIdA) ?? "..."}
      {@const aliasB = resolveAlias(candidate.clientIdB) ?? "..."}
      <ListItem title={m.mergeCandidates_pair({ aliasA, aliasB })}>
        {#snippet subtitle()}
          <Chip class="match-chip" outline>
            {matchLabel(candidate.matchKind)}
          </Chip>
        {/snippet}
        {#snippet after()}
          <span class="candidate-actions">
            <Button
              small
              outline
              onclick={() => onreview(candidate.clientIdA, candidate.clientIdB)}
            >
              {m.mergeCandidates_review()}
            </Button>
            <Button
              small
              clear
              onclick={() =>
                ondismiss(candidate.clientIdA, candidate.clientIdB)}
            >
              {m.mergeCandidates_dismiss()}
            </Button>
          </span>
        {/snippet}
      </ListItem>
    {/each}
  </List>
</CollapsibleSection>

<style>
  :global(.merge-candidates-notice) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .notice-text {
    font-size: 0.75rem;
    color: var(--muted);
    line-height: 1.4;
    margin: 0;
  }

  .candidate-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  :global(.match-chip) {
    font-size: 0.625rem !important;
    padding-inline: 0.375rem !important;
    margin-top: 0.125rem;
  }
</style>
