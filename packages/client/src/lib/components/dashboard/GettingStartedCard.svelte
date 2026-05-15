<!--
  GettingStartedCard: admin-only dashboard card showing recommended
  post-setup actions. Derives completion state from server data.
  Collapsible (matches other dashboard sections) and dismissable
  (persisted server-side in org_config).
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { goto } from "$app/navigation";
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
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { haptic } from "$lib/utils/haptic.js";

  interface Props {
    expanded: boolean;
    ontoggle: () => void;
  }

  let { expanded, ontoggle }: Props = $props();

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

  interface ChecklistMeta {
    readonly id: string;
    readonly label: () => string;
    readonly desc: () => string;
    readonly icon: typeof UserPlus;
    readonly href: string;
  }

  const itemMeta: ChecklistMeta[] = [
    {
      id: "invite",
      label: m.getting_started_invite,
      desc: m.getting_started_invite_desc,
      icon: UserPlus,
      href: "/admin/people",
    },
    {
      id: "branding",
      label: m.getting_started_branding,
      desc: m.getting_started_branding_desc,
      icon: Palette,
      href: "/admin/organization",
    },
    {
      id: "greetings",
      label: m.getting_started_greetings,
      desc: m.getting_started_greetings_desc,
      icon: Phone,
      href: "/admin/communications",
    },
    {
      id: "sms",
      label: m.getting_started_sms,
      desc: m.getting_started_sms_desc,
      icon: MessageSquare,
      href: "/admin/communications",
    },
    {
      id: "presets",
      label: m.getting_started_presets,
      desc: () => m.getting_started_presets_desc(withTerms()),
      icon: Reply,
      href: "/admin/communications",
    },
    {
      id: "kb",
      label: () => m.getting_started_kb(withTerms()),
      desc: () => m.getting_started_kb_desc(withTerms()),
      icon: BookOpen,
      href: "/kb",
    },
    {
      id: "queues",
      label: () => m.getting_started_queues(withTerms()),
      desc: () => m.getting_started_queues_desc(withTerms()),
      icon: Layers,
      href: "/admin/communications",
    },
    {
      id: "retention",
      label: m.getting_started_retention,
      desc: m.getting_started_retention_desc,
      icon: ShieldCheck,
      href: "/admin/organization",
    },
  ];

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
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- hrefs are hardcoded valid routes in itemMeta
    void goto(href);
  }
</script>

{#if visible}
  <CollapsibleSection
    heading={m.getting_started_heading()}
    count={totalCount - doneCount}
    icon={Rocket}
    iconColor="var(--brand-accent, #f59e0b)"
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
    color: var(--brand-primary, #22c55e);
  }

  :global(.check-pending) {
    color: var(--muted, #999);
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
