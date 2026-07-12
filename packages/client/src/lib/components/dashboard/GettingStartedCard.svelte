<!--
  GettingStartedCard: admin-only dashboard card showing recommended
  post-setup actions. Derives completion state from server data.
  Collapsible (matches other dashboard sections) and dismissable
  (persisted server-side in org_config).
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import {
    CircleCheck,
    Circle,
    X,
    Rocket,
    UserPlus,
    Palette,
    Phone,
    MessageSquare,
    Reply,
    BookOpen,
    Layers,
    ShieldCheck,
  } from "@lucide/svelte";
  import CollapsibleSection from "./CollapsibleSection.svelte";
  import { trpc } from "$lib/trpc/index.js";
  import * as m from "$lib/paraglide/messages.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { CHECKLIST_ITEMS } from "$lib/onboarding/checklist-items.js";

  interface Props {
    expanded: boolean;
    ontoggle: () => void;
    /** Content components never navigate; the route wires this to goto. */
    onnavigate: (path: string) => void;
  }

  let { expanded, ontoggle, onnavigate }: Props = $props();

  const queryClient = useQueryClient();

  const checklistQuery = createQuery(() => ({
    queryKey: ["dashboard", "setupChecklist"],
    queryFn: async () => trpc.dashboard.getSetupChecklist.query(),
    staleTime: 60_000,
  }));

  const dismissMut = createMutation(() => ({
    mutationFn: async () => trpc.dashboard.dismissSetupChecklist.mutate(),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["dashboard", "setupChecklist"],
      });
      const previous = queryClient.getQueryData([
        "dashboard",
        "setupChecklist",
      ]);
      queryClient.setQueryData(["dashboard", "setupChecklist"], {
        dismissed: true,
        items: [],
      });
      return { previous };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context: { previous: unknown } | undefined,
    ) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          ["dashboard", "setupChecklist"],
          context.previous,
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "setupChecklist"],
      });
    },
  }));

  const ICONS: Record<string, typeof UserPlus> = {
    invite: UserPlus,
    branding: Palette,
    greetings: Phone,
    sms: MessageSquare,
    presets: Reply,
    kb: BookOpen,
    queues: Layers,
    retention: ShieldCheck,
  };

  const HREFS: Record<string, string> = {
    invite: "/admin/people",
    branding: "/admin/organization",
    greetings: "/admin/communications",
    sms: "/admin/communications",
    presets: "/admin/communications",
    kb: "/library",
    queues: "/admin/communications",
    retention: "/admin/organization",
  };

  const itemMeta = CHECKLIST_ITEMS.map((item) => ({
    ...item,
    icon: ICONS[item.id] ?? Circle,
    href: HREFS[item.id] ?? "/",
  }));

  const visible = $derived(
    checklistQuery.isSuccess &&
      !checklistQuery.data.dismissed &&
      checklistQuery.data.items.length > 0,
  );

  const items = $derived(checklistQuery.data?.items ?? []);

  const doneCount = $derived(items.filter((i) => i.complete).length);
  const totalCount = $derived(items.length);

  function isComplete(id: string): boolean {
    return items.find((i) => i.id === id)?.complete ?? false;
  }

  function handleDismiss(e: MouseEvent): void {
    e.stopPropagation();
    haptic();
    dismissMut.mutate(undefined);
  }

  function handleItemTap(href: string): void {
    haptic();
    onnavigate(href);
  }
</script>

{#if visible}
  <CollapsibleSection
    heading={m.getting_started_heading()}
    count={totalCount - doneCount}
    icon={Rocket}
    iconColor="var(--brand-accent)"
    {expanded}
    {ontoggle}
  >
    {#snippet headerExtra()}
      <button
        class="dismiss-btn touch-feedback"
        onclick={handleDismiss}
        disabled={dismissMut.isPending}
        aria-label={m.getting_started_dismiss()}
        type="button"
      >
        <X size={16} />
      </button>
    {/snippet}
    <List strong inset>
      {#each itemMeta as meta (meta.id)}
        {@const complete = isComplete(meta.id)}
        <ListItem
          title={meta.label()}
          subtitle={meta.desc()}
          onclick={() => handleItemTap(meta.href)}
        >
          {#snippet media()}
            {#if complete}
              <CircleCheck size={22} class="check-done" />
            {:else}
              <Circle size={22} class="check-pending" />
            {/if}
          {/snippet}
        </ListItem>
      {/each}
    </List>
    <div class="progress-bar">
      <p class="progress-text">
        {m.getting_started_progress({
          done: String(doneCount),
          total: String(totalCount),
        })}
      </p>
    </div>
  </CollapsibleSection>
{/if}

<style>
  .dismiss-btn {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: 50%;
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .dismiss-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  :global(.check-done) {
    color: var(--brand-accent);
  }

  :global(.check-pending) {
    color: var(--muted);
  }

  .progress-bar {
    padding: var(--space-sm) var(--space-lg) var(--space-md);
  }

  .progress-text {
    font-size: var(--text-sm);
    color: var(--muted);
    text-align: center;
    margin: 0;
  }
</style>
