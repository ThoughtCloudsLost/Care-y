<!--
  Tickets + conversation flow for the demo.

  The script walks from skeleton rows through a descramble wave and
  ViewSwitcher hops (list/cards/grid), then a card tap opens the
  conversation, whose bubbles reveal with an ERROR/retry beat before
  a scripted typing reply and a restart.

  Uses a LOCAL $state viewMode (never the persisted store).
  Page orchestration is demo-reimplemented (no route imports).
-->
<script lang="ts">
  import { untrack } from "svelte";
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
  } from "$demo/fixtures/tickets.js";
  import { buildScriptedReply } from "$demo/fixtures/conversation.js";
  import type { DemoTicket, DemoFollowUp } from "$demo/fixtures/types.js";
  import * as copy from "$demo/fixtures/copy.js";
  import {
    demoSeed,
    demoReset,
    getTicketDecryptCache,
  } from "$lib/crypto/context";
  import type { DataCardProps } from "$lib/tickets/ticket-card-props.js";
  import { makeSkeletonCardProps } from "$lib/tickets/skeleton-card-props.js";
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import ViewSwitcher from "$lib/components/ViewSwitcher.svelte";
  import ConversationDemo from "./ConversationDemo.svelte";

  type ViewMode = "list" | "cards" | "grid";

  // -----------------------------------------------------------------------
  // Props (bindable script handle for App's caption bar)
  // -----------------------------------------------------------------------

  interface Props {
    script?: DemoScript | undefined;
  }

  let { script = $bindable(undefined) }: Props = $props();

  // -----------------------------------------------------------------------
  // Internal state
  // -----------------------------------------------------------------------

  let viewMode: ViewMode = $state("list");
  let showSkeleton = $state(true);
  let activeTicket: DemoTicket | null = $state(null);
  let appendedFollowUps: DemoFollowUp[] = $state([]);
  let typingText = $state("");
  let showTypingDock = $state(false);

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

  const ticketCache = getTicketDecryptCache();
  const reveal = createRevealController();
  let tickets: DemoTicket[] = $state(createDemoTickets());

  // -----------------------------------------------------------------------
  // Card interaction
  // -----------------------------------------------------------------------

  function handleCardTap(ticketId: string): void {
    // During the "tap card" step, any card tap advances the script
    if (scriptHandle === undefined) return;
    const step = scriptHandle.current;
    if (step.id !== "tap-card") return;

    const t = tickets.find((tk) => tk.id === ticketId);
    if (t !== undefined) {
      activeTicket = t;
    }
    scriptHandle.advance();
  }

  function cardPropsForTicket(ticket: DemoTicket): DataCardProps {
    const raw = ticketCache.get(ticket.id);
    return mapToCardProps(ticket, raw, handleCardTap);
  }

  const skeletonCards: DataCardProps[] = Array.from({ length: 5 }, () =>
    makeSkeletonCardProps(),
  );

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
  //
  // Closures read `tickets` and `activeTicket` through the module-scope
  // variables so they always see the current value (post-restart too).
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
        activeTicket = null;
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

        // Schedule preview follow-up content reveals into the followUp cache
        // TicketPreview reads via followUpCache.decryptContent(fu.id, ...)
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
        activeTicket = null;
        appendedFollowUps = [];
        showTypingDock = false;
        typingText = "";
        showSkeleton = true;
        viewMode = "list";
        demoReset();
        tickets = createDemoTickets();
        scriptHandle?.restart();
      },
    },
  ];

  // -----------------------------------------------------------------------
  // Script initialization (runs once, outside $effect)
  // -----------------------------------------------------------------------

  // Plain let, not $state: the handle is only read inside closures and its
  // reactivity lives in the DemoScript getters themselves. $state here would
  // trip state_referenced_locally on the bindable assignment below.
  let scriptHandle: DemoScript | undefined = undefined;

  const ctx: DemoScriptContext = {
    reveal,
    advance(): void {
      scriptHandle?.advance();
    },
  };

  // Initialize synchronously (not inside $effect, which would re-run
  // on every state mutation the enter callbacks perform).
  scriptHandle = untrack(() => createDemoScript(steps, ctx));
  script = scriptHandle;

  // Clean up all timers when the component is destroyed
  $effect(() => {
    return () => {
      clearAllTimers();
      reveal.reset();
    };
  });
</script>

<div class="tickets-flow">
  {#if activeTicket !== null}
    <ConversationDemo ticket={activeTicket} {appendedFollowUps} />

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
    <div class="tickets-toolbar">
      <ViewSwitcher
        mode={viewMode}
        modes={["list", "cards", "grid"]}
        onchange={(next: string) => {
          if (next === "list" || next === "cards" || next === "grid") {
            viewMode = next;
          }
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
  .tickets-flow {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

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
