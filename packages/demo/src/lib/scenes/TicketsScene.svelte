<!--
  Tickets scene: renders inside AppShell as the page content for the
  tickets tab. Shows the ticket list with skeleton-to-descramble reveal,
  view switching, and card tap navigation. When router.detail is set,
  shows the conversation detail view with bubble reveals, error/retry
  beat, and scripted typing reply.

  Seeds the TanStack query cache with fixture tickets under the
  production query keys so the shell's search providers can read them.

  Uses LOCAL $state viewMode (never the persisted store).
-->
<script lang="ts">
  import { untrack } from "svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import * as m from "$lib/paraglide/messages.js";
  import {
    createDemoScript,
    type DemoScript,
    type DemoStep,
    type DemoScriptContext,
  } from "$demo/engine/script.svelte.js";
  import {
    createRevealController,
    type RevealEntry,
  } from "$demo/engine/reveal.svelte.js";
  import {
    createDemoTickets,
    mapToCardProps,
    mapToPreviewFollowUps,
    buildSeedData,
    mapToTicketLikeRecord,
  } from "$demo/fixtures/tickets.js";
  import { buildScriptedReply } from "$demo/fixtures/conversation.js";
  import type { DemoTicket, DemoFollowUp } from "$demo/fixtures/types.js";
  import * as copy from "$demo/fixtures/copy.js";
  import {
    demoSeed,
    demoReset,
    getTicketDecryptCache,
  } from "$lib/crypto/context";
  import {
    resolveAsyncDecrypt,
    type DecryptResult,
  } from "$lib/crypto/decrypt-result.js";
  import { resolveQueueAppearance } from "$lib/utils/queue-appearance.js";
  import { followUpKind } from "$lib/tickets/follow-up-utils.js";
  import { ticketsKeys } from "$lib/query/keys.js";
  import type { DataCardProps } from "$lib/tickets/ticket-card-props.js";
  import { makeSkeletonCardProps } from "$lib/tickets/skeleton-card-props.js";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import ViewSwitcher from "$lib/components/ViewSwitcher.svelte";
  import EncryptedTitle from "$lib/components/EncryptedTitle.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import PriorityStamp from "$lib/components/PriorityStamp.svelte";
  import QueueGlyph from "$lib/components/shared/QueueGlyph.svelte";
  import ConversationBubble from "$lib/components/tickets/ConversationBubble.svelte";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  // -----------------------------------------------------------------------
  // Internal state
  // -----------------------------------------------------------------------

  let viewMode: ViewMode = $state("list");
  let showSkeleton = $state(true);
  let appendedFollowUps: DemoFollowUp[] = $state([]);
  let typingText = $state("");
  let showTypingDock = $state(false);

  const queryClient = useQueryClient();
  const ticketCache = getTicketDecryptCache();
  const reveal = createRevealController();
  let tickets: DemoTicket[] = $state(createDemoTickets());

  // -----------------------------------------------------------------------
  // Router access (read from DemoSurface's reactive props via $app/navigation)
  //
  // The scene does not import the router directly. Card taps call
  // goto("/tickets/<id>"), intercepted by the demo navigation handler.
  // The router sets `detail`, which DemoSurface passes down. For reading
  // the detail state, we use a local reactive variable updated by an
  // $effect that watches the "active ticket" derivation from the router.
  //
  // Instead of coupling to the router, we derive activeTicket from the
  // query cache seeded tickets and the detail ID set by the parent.
  // The parent (DemoSurface) passes the scene component with no props;
  // the scene reads the detail from the URL interception pattern.
  // -----------------------------------------------------------------------

  // The scene needs to know which ticket is "open" for detail view.
  // It tracks this by watching `goto` calls: when ontap fires, it calls
  // goto("/tickets/<id>"), the router sets detail, and DemoSurface
  // re-renders the scene. But the scene itself is a static component
  // (no props from DemoSurface). We track detail internally by hooking
  // into the ontap callback. The router handles outer narrative sync.
  let activeTicketId: string | null = $state(null);

  const activeTicket: DemoTicket | null = $derived(
    activeTicketId !== null
      ? (tickets.find((t) => t.id === activeTicketId) ?? null)
      : null,
  );

  /** Pending timers that must be cleared on destroy and restart. */
  const pendingTimers: ReturnType<typeof setTimeout>[] = [];

  function addTimer(id: ReturnType<typeof setTimeout>): void {
    pendingTimers.push(id);
  }

  function clearAllTimers(): void {
    for (const id of pendingTimers) {
      clearTimeout(id);
    }
    pendingTimers.length = 0;
  }

  // -----------------------------------------------------------------------
  // Query cache seeding for search
  // -----------------------------------------------------------------------

  function seedQueryCache(): void {
    const records = tickets.map(mapToTicketLikeRecord);
    queryClient.setQueryData(ticketsKeys.list({}), records);
  }

  // Seed on mount
  seedQueryCache();

  // -----------------------------------------------------------------------
  // Card interaction
  // -----------------------------------------------------------------------

  function handleCardTap(ticketId: string): void {
    // Set local detail state so the conversation view renders
    activeTicketId = ticketId;
    // Navigate via goto so the demo router picks it up for narrative sync
    void goto(resolve(`/tickets/${ticketId}`));
    // If we are on the tap-card step, advance the script
    if (scriptHandle !== undefined) {
      const step = scriptHandle.current;
      if (step.id === "tap-card") {
        scriptHandle.advance();
      }
    }
  }

  function handleBack(): void {
    activeTicketId = null;
    // Navigate back to the list so the router clears detail
    void goto(resolve("/tickets"));
  }

  function cardPropsForTicket(ticket: DemoTicket): DataCardProps {
    const raw = ticketCache.get(ticket.id);
    return mapToCardProps(ticket, raw, handleCardTap);
  }

  const skeletonCards: DataCardProps[] = Array.from({ length: 5 }, () =>
    makeSkeletonCardProps(),
  );

  // -----------------------------------------------------------------------
  // Conversation detail helpers
  // -----------------------------------------------------------------------

  const queueAppearance = resolveQueueAppearance(null, null);

  function deriveTitleResult(ticket: DemoTicket): DecryptResult {
    return resolveAsyncDecrypt(
      ticketCache.get(ticket.id),
      ticket.keyWrap !== null,
    );
  }

  function resolveFollowUpContent(
    ticket: DemoTicket,
    fu: DemoFollowUp,
  ): DecryptResult {
    if (fu.source === "system") {
      return { status: "ready", value: fu.content };
    }
    const cacheKey = `fu:${fu.ticketId}:${fu.id}`;
    const raw = ticketCache.get(cacheKey);
    return resolveAsyncDecrypt(raw, ticket.keyWrap !== null);
  }

  // -----------------------------------------------------------------------
  // Constants
  // -----------------------------------------------------------------------

  const REPLY_TEXT =
    "I found a shelter that has openings. Let me send you the details.";
  const REPLY_ID = "fu-demo-reply";
  const TYPING_CHAR_MS = 30;

  /** First ticket (Housing) has the richest conversation. */
  const CONVERSATION_TICKET_INDEX = 0;

  /** Pick the last non-empty client message for the ERROR beat. */
  function getErrorFollowUp(ticket: DemoTicket): DemoFollowUp | undefined {
    const clientMessages = ticket.followUps.filter(
      (fu) => fu.source === "client" && fu.content !== "",
    );
    return clientMessages[clientMessages.length - 1];
  }

  // -----------------------------------------------------------------------
  // Step definitions
  // -----------------------------------------------------------------------

  const steps: DemoStep[] = [
    // 0: Skeleton loading
    {
      id: "skeleton",
      caption: copy.ticketsSkeleton,
      advance: "auto",
      autoDelayMs: 1800,
      enter: () => {
        showSkeleton = true;
        activeTicketId = null;
        viewMode = "list";
        appendedFollowUps = [];
        typingText = "";
        showTypingDock = false;
      },
    },

    // 1: Descramble wave
    {
      id: "descramble",
      caption: copy.ticketsDescramble,
      advance: "event",
      enter: (ctx: DemoScriptContext) => {
        showSkeleton = false;

        // Seed preview data immediately (not encrypted)
        const seed = buildSeedData(tickets);
        demoSeed({ previews: seed.previews });

        // Schedule staggered title reveals (400-1400ms)
        const allEntries: RevealEntry[] = [];
        let delay = 400;
        for (const ticket of tickets) {
          if (ticket.keyWrap !== null) {
            allEntries.push({
              key: ticket.id,
              value: ticket.title,
              delayMs: delay,
              cache: "ticket",
            });
            delay += 120;
          }
        }

        // Schedule preview follow-up content reveals
        for (const ticket of tickets) {
          if (ticket.keyWrap === null) continue;
          const previews = mapToPreviewFollowUps(ticket);
          for (const preview of previews) {
            if (typeof preview.id !== "string") continue;
            const previewId = preview.id;
            const fu = ticket.followUps.find((f) => f.id === previewId);
            if (fu !== undefined && fu.content !== "") {
              allEntries.push({
                key: previewId,
                value: fu.content,
                delayMs: delay,
                cache: "followUp",
              });
              delay += 80;
            }
          }
        }

        ctx.reveal.schedule(allEntries);

        // Auto-advance after all reveals complete
        addTimer(
          setTimeout(() => {
            ctx.advance();
          }, delay + 200),
        );
      },
    },

    // 2: View switcher, list
    {
      id: "view-list",
      caption: copy.ticketsViewList,
      advance: "auto",
      autoDelayMs: 1500,
      enter: () => {
        viewMode = "list";
      },
    },

    // 3: View switcher, cards
    {
      id: "view-cards",
      caption: copy.ticketsViewCards,
      advance: "auto",
      autoDelayMs: 1500,
      enter: () => {
        viewMode = "cards";
      },
    },

    // 4: View switcher, grid
    {
      id: "view-grid",
      caption: copy.ticketsViewGrid,
      advance: "auto",
      autoDelayMs: 1500,
      enter: () => {
        viewMode = "grid";
      },
    },

    // 5: Tap card prompt (switch to cards for the tap target)
    {
      id: "tap-card",
      caption: copy.ticketsTapCard,
      get target(): string | undefined {
        return tickets.at(CONVERSATION_TICKET_INDEX)?.id;
      },
      advance: "tap",
      enter: () => {
        viewMode = "cards";
      },
    },

    // 6: Conversation header reveal
    {
      id: "conv-header",
      caption: copy.conversationHeader,
      advance: "auto",
      autoDelayMs: 1500,
      enter: () => {
        const t = activeTicket;
        if (t !== null && t.keyWrap !== null) {
          demoSeed({ titles: { [t.id]: t.title } });
        }
      },
    },

    // 7: Conversation bubble reveals
    {
      id: "conv-reveal",
      caption: copy.conversationReveal,
      advance: "event",
      enter: (ctx: DemoScriptContext) => {
        const t = activeTicket;
        if (t === null) return;

        const entries: RevealEntry[] = [];
        let d = 400;
        for (const fu of t.followUps) {
          if (fu.source === "system" || fu.content === "") continue;
          entries.push({
            key: `fu:${t.id}:${fu.id}`,
            value: fu.content,
            delayMs: d,
            cache: "ticket",
          });
          d += Math.min(400 + Math.random() * 200, 600);
        }

        ctx.reveal.schedule(entries);

        addTimer(
          setTimeout(() => {
            ctx.advance();
          }, d + 300),
        );
      },
    },

    // 8: Error beat (fail one bubble)
    {
      id: "conv-error",
      caption: copy.conversationError,
      advance: "auto",
      autoDelayMs: 2000,
      enter: (ctx: DemoScriptContext) => {
        const t = activeTicket;
        if (t === null) return;
        const errorFu = getErrorFollowUp(t);
        if (errorFu !== undefined) {
          ctx.reveal.failNow(`fu:${t.id}:${errorFu.id}`, "ticket");
        }
      },
    },

    // 9: Retry beat (schedule successful reveal)
    {
      id: "conv-retry",
      caption: copy.conversationRetry,
      advance: "event",
      enter: (ctx: DemoScriptContext) => {
        const t = activeTicket;
        if (t === null) return;
        const errorFu = getErrorFollowUp(t);
        if (errorFu !== undefined) {
          ctx.reveal.schedule([
            {
              key: `fu:${t.id}:${errorFu.id}`,
              value: errorFu.content,
              delayMs: 800,
              cache: "ticket",
            },
          ]);
          addTimer(
            setTimeout(() => {
              ctx.advance();
            }, 1200),
          );
        }
      },
    },

    // 10: Typing dock animation (~30ms/char)
    {
      id: "conv-typing",
      caption: copy.conversationTyping,
      advance: "event",
      enter: (ctx: DemoScriptContext) => {
        showTypingDock = true;
        typingText = "";

        let charIndex = 0;
        function typeNextChar(): void {
          if (charIndex >= REPLY_TEXT.length) {
            addTimer(
              setTimeout(() => {
                ctx.advance();
              }, 500),
            );
            return;
          }
          typingText = REPLY_TEXT.slice(0, charIndex + 1);
          charIndex += 1;
          addTimer(setTimeout(typeNextChar, TYPING_CHAR_MS));
        }

        addTimer(setTimeout(typeNextChar, 300));
      },
    },

    // 11: Sent bubble appears
    {
      id: "conv-sent",
      caption: copy.conversationSent,
      advance: "auto",
      autoDelayMs: 2000,
      enter: () => {
        showTypingDock = false;
        typingText = "";

        const t = activeTicket;
        if (t === null) return;
        const reply = buildScriptedReply(t.id, REPLY_TEXT, REPLY_ID);
        appendedFollowUps = [reply];

        // Seed the reply content into the ticket cache so it decrypts
        demoSeed({
          followUps: { [`fu:${t.id}:${REPLY_ID}`]: REPLY_TEXT },
        });
      },
    },

    // 12: Auto-restart (loops back to skeleton)
    {
      id: "restart",
      caption: copy.ticketsSkeleton,
      advance: "auto",
      autoDelayMs: 2000,
      enter: () => {
        clearAllTimers();
        activeTicketId = null;
        appendedFollowUps = [];
        showTypingDock = false;
        typingText = "";
        showSkeleton = true;
        viewMode = "list";
        demoReset();
        tickets = createDemoTickets();
        // Re-seed display name for navbar avatar
        demoSeed({
          orgValues: { "me:display_name": "Jordan Kim" },
        });
        // Re-seed query cache
        seedQueryCache();
        scriptHandle?.restart();
      },
    },
  ];

  // -----------------------------------------------------------------------
  // Script initialization
  // -----------------------------------------------------------------------

  let scriptHandle: DemoScript | undefined = undefined;

  const ctx: DemoScriptContext = {
    reveal,
    advance(): void {
      scriptHandle?.advance();
    },
  };

  scriptHandle = untrack(() => createDemoScript(steps, ctx));

  // Clean up all timers when the component is destroyed
  $effect(() => {
    return () => {
      clearAllTimers();
      reveal.reset();
    };
  });
</script>

<div class="tickets-scene">
  {#if activeTicket !== null}
    <!-- Conversation detail view -->
    {@const ticket = activeTicket}
    {@const titleResult = deriveTitleResult(ticket)}
    {@const allFollowUps = [...ticket.followUps, ...appendedFollowUps]}

    <button
      type="button"
      class="conv-back"
      onclick={handleBack}
      aria-label={m.common_back()}
    >
      <svg width="10" height="17" viewBox="0 0 10 17" aria-hidden="true">
        <path
          d="M9 1L1 8.5L9 16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
    </button>

    <header class="conv-header">
      <StatusMark status={ticket.displayStatus} />
      <div class="conv-header-main">
        <span class="conv-title">
          {#if titleResult.status === "denied" || titleResult.status === "error"}
            <EncryptedTitle />
          {:else}
            <DecryptPlaceholder
              result={titleResult}
              ciphertext={ticket.encryptedTitle}
              length={25}
            />
          {/if}
        </span>
        <span class="conv-meta">
          <QueueGlyph appearance={queueAppearance} size={12} />
          <span class="conv-queue">{ticket.queueName}</span>
          <span class="conv-alias">{ticket.clientAlias}</span>
          {#if ticket.priority !== "normal"}
            <PriorityStamp priority={ticket.priority} />
          {/if}
        </span>
      </div>
    </header>

    <div class="conv-thread">
      {#each allFollowUps as fu (fu.id)}
        {@const kind = followUpKind(fu)}
        {@const result = resolveFollowUpContent(ticket, fu)}
        {#if kind === "system"}
          <SystemEvent
            type={fu.type}
            timestamp={fu.createdAt.toISOString()}
            eventParams={fu.eventParams}
          />
        {:else if kind === "note"}
          <ConversationBubble
            direction="sent"
            source="volunteer"
            timestamp={fu.createdAt.toISOString()}
          >
            <span class="note-label">{m.demo_conversation_note_label()}</span>
            <span class="bubble-text">
              <DecryptPlaceholder
                {result}
                ciphertext={fu.encryptedContent}
                length={30}
                block
              />
            </span>
          </ConversationBubble>
        {:else}
          <ConversationBubble
            direction={fu.source === "client" ? "received" : "sent"}
            speaker={fu.source === "client" ? ticket.clientAlias : undefined}
            source={fu.source === "client" ? "client" : "volunteer"}
            timestamp={fu.createdAt.toISOString()}
          >
            <span class="bubble-text">
              <DecryptPlaceholder
                {result}
                ciphertext={fu.encryptedContent}
                length={30}
                block
              />
            </span>
          </ConversationBubble>
        {/if}
      {/each}
    </div>

    {#if showTypingDock}
      <div class="typing-dock">
        <div class="typing-input">
          <span class="typing-text"
            >{typingText}<span class="typing-cursor">|</span></span
          >
        </div>
        <button
          type="button"
          class="typing-send"
          disabled={typingText.length === 0}
        >
          {m.demo_reply_send()}
        </button>
      </div>
    {/if}
  {:else}
    <!-- Ticket list view -->
    <div class="tickets-toolbar">
      <ViewSwitcher
        mode={viewMode}
        modes={["list", "cards", "grid"]}
        onchange={(next: ViewMode) => {
          viewMode = next;
        }}
      />
    </div>

    <div class="tickets-list" class:tickets-grid={viewMode === "grid"}>
      {#if showSkeleton}
        {#each skeletonCards as props, i (i)}
          <TicketCard {viewMode} {...props} loading={true} />
        {/each}
      {:else}
        {#each tickets as ticket (ticket.id)}
          {@const props = cardPropsForTicket(ticket)}
          <TicketCard
            {viewMode}
            {...props}
            encryptedTitle={ticket.encryptedTitle}
          />
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .tickets-scene {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Ticket list styles */
  .tickets-toolbar {
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px;
    border-bottom: 1px solid var(--hair);
    flex-shrink: 0;
  }

  .tickets-list {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tickets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px;
  }

  /* Conversation detail styles */
  .conv-back {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    background: var(--raised);
    border: none;
    border-bottom: 1px solid var(--hair);
    color: var(--brand-text, #007aff);
    font-size: var(--text-sm);
    cursor: pointer;
    flex-shrink: 0;
  }

  .conv-header {
    display: grid;
    grid-template-columns: 22px 1fr;
    column-gap: 10px;
    align-items: start;
    padding: 12px 16px;
    border-bottom: 1px solid var(--hair);
    background: var(--raised);
    flex-shrink: 0;
  }

  .conv-header-main {
    min-width: 0;
  }

  .conv-title {
    display: block;
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .conv-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-sm);
    color: var(--muted);
    margin-top: 2px;
  }

  .conv-queue {
    white-space: nowrap;
  }

  .conv-alias {
    white-space: nowrap;
  }

  .conv-alias::before {
    content: "\00B7";
    margin-right: 6px;
  }

  .conv-thread {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    -webkit-overflow-scrolling: touch;
  }

  .bubble-text {
    overflow-wrap: break-word;
  }

  .note-label {
    display: block;
    font-size: 0.65625rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    color: var(--muted);
    margin-bottom: 2px;
    font-style: italic;
  }

  /* Typing dock at the bottom of conversation */
  .typing-dock {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-top: 1px solid var(--hair);
    background: var(--raised);
    flex-shrink: 0;
  }

  .typing-input {
    flex: 1;
    min-height: 36px;
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 18px;
    border: 1px solid var(--hair-2);
    background: var(--paper);
    font-size: var(--text-base);
    color: var(--ink);
    overflow: hidden;
  }

  .typing-text {
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .typing-cursor {
    animation: blink 1s step-end infinite;
    color: var(--brand-text);
    font-weight: 300;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .typing-cursor {
      animation: none;
    }
  }

  .typing-send {
    padding: 6px 14px;
    border-radius: 18px;
    border: none;
    background: var(--brand-text);
    color: white;
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: default;
    flex-shrink: 0;
  }

  .typing-send:disabled {
    opacity: 0.4;
  }
</style>
