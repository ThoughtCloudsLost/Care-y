<!--
  PhoneApp: root component for the phone iframe document.

  Mounts LoginMount (pre-auth) or AppShell + RouteMount (post-auth)
  inside a Konsta App root wrapped in a TanStack QueryClientProvider.
  Exposes a DemoBridge on window.demoBridge so the outer page can move
  the shared location, toggle the scheme, and subscribe to state.

  This is the iframe's entire module graph entry. Router, location
  store, query client, crypto seeding, and goto interception all live
  here. The DemoLocationStore owns the canonical location state for
  the demo; this component supplies its two DOM-facing drivers
  (reading the phone screen state, driving the phone to a screen).

  The PGlite engine boots in phone-main.ts before this component
  mounts. The engine promise is passed as a prop; when it resolves,
  PhoneApp seeds the crypto-context identity (userId, userRoleId)
  and resolves the real detail ticket ID for the outer-page sentinel.
-->
<script lang="ts">
  import { App, Preloader } from "konsta/svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import {
    registerDemoNavigationHandler,
    unregisterDemoNavigationHandler,
  } from "$app/navigation";
  import * as m from "$lib/paraglide/messages.js";
  import type { TabId, AreaId } from "$lib/shell/types.js";
  import AppShell from "$lib/shell/AppShell.svelte";
  import DemoSplash from "$demo/DemoSplash.svelte";
  import LoginMount from "$demo/LoginMount.svelte";
  import RouteMount from "$demo/engine/RouteMount.svelte";
  import { createDemoRouter, featureForPathname } from "$demo/router.svelte.js";
  import { page as demoPage } from "./stubs/app-state.svelte.js";
  import { createDemoQueryClient } from "$demo/demo-query-client.js";
  import { createDemoLocationStore } from "$demo/demo-location.svelte.js";
  import type { PhoneCommand } from "$demo/scroll-sections.js";
  import { routeForSlug, pathnameForRouteId } from "$demo/scroll-sections.js";
  import { evaluateAdvance } from "$demo/login-advance-guard.js";
  import { listRouteIds } from "$demo/engine/route-manifest.js";
  import {
    demoSeed,
    ensureKeyed,
    setRoleAndPermissions,
    replayDescramble,
  } from "$lib/crypto/context.js";
  import { isPacedLoginInFlight } from "./stubs/login-crypto.js";
  import { RoleId, type RoleIdValue } from "@care-y/shared";
  import {
    classifyDemoLabel,
    type DemoLocale,
  } from "$demo/topic-classifier.js";
  import { locales } from "$lib/paraglide/runtime.js";
  import {
    getLoginStage,
    setLoginStage,
    resetLoginStage,
  } from "$demo/login-stage.svelte.js";
  import { setDemoAuthed, armPushChallenge } from "./stubs/trpc.js";
  import {
    topicFeatureTarget,
    buildTopicCandidates,
    buildActivationCandidates,
    findTopicElement,
    findTopicElementBySelector,
    findClickableTarget,
    isNavChrome,
    dismissOpenOverlays,
    waitForElement,
    renderPulseMarker,
    TAP_TOPICS,
  } from "$demo/tap-pulse.js";
  import { recordPulseOutcome } from "$demo/pulse-log.js";
  import {
    DEMO_DETAIL_TICKET_ID,
    DEMO_DETAIL_ARTICLE_ID,
  } from "$demo/bridge.js";
  import {
    activateSettingsDriver,
    deactivateSettingsDriver,
  } from "$demo/settings-driver.js";
  import {
    pollUntil,
    POLL_TIMEOUT_SHORT_MS,
    POLL_TIMEOUT_MEDIUM_MS,
    POLL_TIMEOUT_STANDARD_MS,
  } from "$demo/poll.js";
  import type { DemoEngineResult } from "$demo/engine/engine.js";
  import { onOutboxAppend } from "$demo/engine/outbox.js";
  import {
    beginFlowInteraction,
    emitFlowEvent,
    subscribeFlowEvents,
  } from "$demo/flow-events.js";
  import type {
    DemoBridge,
    DemoBridgeListener,
    DemoBridgeState,
    DemoFeature,
    DemoDetail,
    DemoFlowListener,
    DemoTopic,
    LoginStage,
    LoginAdvanceTarget,
    SectionId,
    PageOrigin,
  } from "$demo/bridge.js";

  // -----------------------------------------------------------------------
  // Props
  // -----------------------------------------------------------------------

  let { enginePromise }: { enginePromise: Promise<DemoEngineResult> } =
    $props();

  // -----------------------------------------------------------------------
  // Router + query client
  // -----------------------------------------------------------------------

  const router = createDemoRouter();
  const queryClient = createDemoQueryClient();

  // crypto-keyed signal is now wired via initBridge().onBridgeStateChange
  // in crypto-context.ts; no hardcode needed.

  // -----------------------------------------------------------------------
  // Engine resolution: crypto seed + real ticket ID
  // -----------------------------------------------------------------------

  // The real detail ticket ID, resolved once the engine boots.
  // Until then, stays null; detail navigations before boot fall
  // back to the tickets list.
  let resolvedDetailId: string | null = $state(null);

  // Flipped once (false -> true) when the PGlite engine finishes
  // booting. Never resets; a failed boot leaves it false so the
  // peek surface keeps showing the blurred still.
  let engineReady = $state(false);

  // Resolved engine instance, captured for the role switcher handler.
  let resolvedEngine: DemoEngineResult | null = null;

  // Count of in-flight login fast-forwards (leaving the login feature
  // before the keys are derived). The preparing overlay renders while
  // nonzero; its CSS reveal is delayed so the common instant
  // resolution never flashes it.
  let fastForwardPending = $state(0);

  // Current role of the signed-in demo user. Starts as ADMIN;
  // the role switcher mutates it in place.
  let currentRole: RoleIdValue = $state(RoleId.ADMIN);

  // The real article ID for the library vote sub-section, resolved
  // once the engine boots.
  let resolvedArticleId: string | null = $state(null);

  /**
   * Map the outer-page sentinel to the real ID. Returns the real
   * ID when the sentinel is passed and the engine has resolved.
   *
   * When the engine has not resolved, behavior depends on `unresolved`:
   *   "sentinel" (default) - returns the sentinel value unchanged
   *   "null" - returns null, so callers that need a valid ID can
   *            fall back to the list rather than navigating to a dead ID
   */
  function sentinelToReal(
    detail: DemoDetail,
    unresolved: "sentinel" | "null" = "sentinel",
  ): DemoDetail {
    if (detail === DEMO_DETAIL_TICKET_ID) {
      if (resolvedDetailId !== null) return resolvedDetailId;
      return unresolved === "null" ? null : detail;
    }
    if (detail === DEMO_DETAIL_ARTICLE_ID) {
      if (resolvedArticleId !== null) return resolvedArticleId;
      return unresolved === "null" ? null : detail;
    }
    return detail;
  }

  // Seed crypto-context and resolve the detail IDs once the engine
  // finishes booting. Failures are already logged by phone-main.ts;
  // we catch here to avoid an unhandled rejection inside the component.
  //
  // enginePromise is a Promise prop set once at mount; capturing the
  // initial value is intentional (the prop never changes).
  // svelte-ignore state_referenced_locally
  void enginePromise
    .then((e) => {
      demoSeed({
        userId: e.seedResult.adminUserId,
        userRoleId: RoleId.ADMIN,
      });
      if (e.ticketIds.length > 0) {
        resolvedDetailId = e.ticketIds[0] ?? null;
      }
      if (e.articleIds.length > 0) {
        resolvedArticleId = e.articleIds[0] ?? null;
      }
      resolvedEngine = e;
      engineReady = true;
      // Eager keying: start the real derivation the moment the engine
      // is up, so the first login-to-elsewhere fast-forward (and every
      // queued decrypt) finds the worker already keyed instead of
      // paying Argon2id at navigation time. The prewarm latch mounts
      // this iframe roughly a viewport before the first clip, so the
      // derivation spends itself against reading time. Failures are
      // swallowed: ensureKeyed clears its cached promise on rejection
      // and the fast-forward path retries.
      void ensureKeyed().catch(() => undefined);
    })
    .catch(() => {
      // Boot failure already surfaced by phone-main.ts console.error.
      // engineReady stays false so the peek keeps showing a blurred still.
    });

  // -----------------------------------------------------------------------
  // Dark scheme
  // -----------------------------------------------------------------------

  // Initialize from the scheme script's class (set by localStorage
  // before any JS loads, or by the outer page's setDark).
  let dark = $state(document.documentElement.classList.contains("dark"));

  /**
   * Apply dark/light scheme and glass classes to the phone document.
   * Mirrors the product's applyScheme/applyGlassMode (theme.svelte.ts):
   * glass styles are anchored to html-level classes, so scheme classes
   * must live on documentElement. Inside the iframe, documentElement IS
   * the phone document root, which is exactly what we want.
   *
   * Preserves existing theme-* classes (set by the blocking scheme script).
   */
  function applyDarkScheme(isDark: boolean): void {
    const cl = document.documentElement.classList;
    cl.toggle("dark", isDark);
    cl.toggle("light", !isDark);
    cl.toggle("glass-dark", isDark);
    cl.toggle("glass-light", !isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }

  $effect(() => {
    applyDarkScheme(dark);
  });

  // -----------------------------------------------------------------------
  // Pathname for RouteMount (derived from router state)
  // -----------------------------------------------------------------------

  // RouteMount pathname: the router's canonical pathname + search string.
  // Login is excluded (RouteMount only mounts post-auth). The search
  // string carries query params (?user= deep links) through to the page.
  const routeMountPathname = $derived(
    router.feature === "login" ? "/tickets" : router.pathname + router.search,
  );

  // -----------------------------------------------------------------------
  // Login stage reactivity
  // -----------------------------------------------------------------------

  const loginStage = $derived(
    router.feature === "login" ? getLoginStage() : null,
  );

  // When feature transitions away from login, clear the stage
  $effect(() => {
    if (router.feature !== "login") {
      setLoginStage(null);
    }
  });

  // -----------------------------------------------------------------------
  // Settings enrollment driver (TOTP + email/SMS auto-fill)
  // -----------------------------------------------------------------------

  $effect(() => {
    if (router.feature === "settings") {
      activateSettingsDriver(document, onOutboxAppend);
      return () => {
        deactivateSettingsDriver();
      };
    }
  });

  // -----------------------------------------------------------------------
  // Effective detail (desktop split view overlay)
  // -----------------------------------------------------------------------

  // At desktop width the client redirects /tickets/[id] to /tickets and
  // carries the ticket in page.state.ticketId (shallow routing; see the
  // client's tickets/[id] route). The router derives detail from the
  // pathname alone, so without this overlay the bridge reports the
  // split view as the bare list and the location store snaps a
  // ticket-detail narration back to the tickets section.
  const splitViewTicketId = $derived.by((): string | null => {
    if (router.feature !== "tickets" || router.detail !== null) return null;
    const id = demoPage.state.ticketId;
    return typeof id === "string" && id !== "" ? id : null;
  });
  const effectiveDetail = $derived(router.detail ?? splitViewTicketId);

  // -----------------------------------------------------------------------
  // Location store (canonical state owner)
  // -----------------------------------------------------------------------

  const store = createDemoLocationStore({
    getPhone: () => ({
      feature: router.feature,
      detail: effectiveDetail,
      searchOpen: router.searchOpen,
      loginStage,
      routeId: router.routeId,
    }),
    ensureScreen,
    getTicketDetailId: () => resolvedDetailId ?? DEMO_DETAIL_TICKET_ID,
    getArticleDetailId: () => resolvedArticleId ?? DEMO_DETAIL_ARTICLE_ID,
  });

  // Every phone screen change lands in the store in the same reactive
  // turn: it re-derives the location, so a phone-originated change can
  // never be dropped (there is no event to miss and no window to hit).
  $effect(() => {
    void router.feature;
    void effectiveDetail;
    void router.searchOpen;
    void loginStage;
    store.notePhoneChange();
  });

  // -----------------------------------------------------------------------
  // Topic classification (with accessible-text fallback)
  // -----------------------------------------------------------------------

  // Capture-phase click listener on the phone document. Walks the
  // event target up to the nearest [aria-label] element and classifies
  // the label string to a DemoTopic via the pure classifier. Falls
  // back to text content for interactive elements without aria-labels.
  /** Record a classified interaction; real visitor taps on the push
   *  method also arm its challenge to approve (synthetic scroll-driven
   *  opens never do, so the waiting screen alone cannot log in). */
  function applyTopic(classified: DemoTopic, trusted: boolean): void {
    store.reportTopic(classified);
    if (trusted) {
      emitFlowEvent({
        lane: "ui",
        direction: "up",
        label: `tap ${classified}`,
      });
    }
    if (trusted && classified === "twofa-push") {
      armPushChallenge();
    }
  }

  $effect(() => {
    function handleClick(event: MouseEvent): void {
      // A real visitor tap takes control: cancel any scripted chain so
      // it cannot confirm a method the visitor only opened to look at,
      // and unpin any page intent so the visitor's interaction drives
      // the location again. Synthetic chain clicks are not trusted
      // events, so they never cancel themselves.
      if (event.isTrusted) {
        store.cancelChains();
        // A trusted tap is the only reliable boundary between two
        // bursts of work, so it opens the band's next interaction.
        beginFlowInteraction();
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const inDetail = effectiveDetail !== null;
      const ctx = { inDetail, feature: router.feature };

      // Try aria-label first
      const labelCandidate =
        target.closest("[aria-label]")?.getAttribute("aria-label") ?? null;
      if (labelCandidate !== null && labelCandidate !== "") {
        const classified = classifyDemoLabel(labelCandidate, ctx);
        if (classified !== null) {
          applyTopic(classified, event.isTrusted);
          return;
        }
      }

      // List items carry title + subtitle in one textContent blob, so
      // whole-text equality never matches their labels. Classify each
      // leaf element's own text instead (the title div is a leaf).
      const listItem = target.closest(".k-list-item");
      if (listItem !== null) {
        for (const leaf of listItem.querySelectorAll<HTMLElement>("*")) {
          if (leaf.childElementCount > 0) continue;
          const text = leaf.textContent.trim();
          if (text === "" || text.length > 80) continue;
          const classified = classifyDemoLabel(text, ctx);
          if (classified !== null) {
            applyTopic(classified, event.isTrusted);
            return;
          }
        }
      }

      // Fallback: trimmed textContent of nearest interactive element
      const interactive = target.closest(
        'button, [role="button"], a, .k-list-item, label',
      );
      if (interactive !== null) {
        const text = interactive.textContent.trim().slice(0, 80);
        if (text !== "") {
          const classified = classifyDemoLabel(text, ctx);
          if (classified !== null) {
            applyTopic(classified, event.isTrusted);
            return;
          }
        }
      }

      // Fallback: placeholder of nearest input
      if (target instanceof HTMLInputElement) {
        const placeholder = target.getAttribute("placeholder");
        if (placeholder !== null && placeholder !== "") {
          const classified = classifyDemoLabel(placeholder, ctx);
          if (classified !== null) {
            applyTopic(classified, event.isTrusted);
            return;
          }
        }
      }

      // Unclassified trusted tap: the band still shows the interaction,
      // labelled with whatever the element gives us.
      if (event.isTrusted) {
        const candidate = (
          labelCandidate ??
          interactive?.textContent ??
          ""
        ).trim();
        const raw = candidate === "" ? target.tagName : candidate;
        emitFlowEvent({
          lane: "ui",
          direction: "up",
          label: `tap ${raw.slice(0, 40).toLowerCase()}`,
        });
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  });

  // -----------------------------------------------------------------------
  // Goto interception
  // -----------------------------------------------------------------------

  // Register goto interception so in-phone goto() calls route through
  // the demo router instead of attempting real navigation. The
  // post-auth goto(resolve("/")) maps to home in the router;
  // the location store follows.
  $effect(() => {
    const handler = (href: string): void => router.handleGoto(href);
    registerDemoNavigationHandler(handler);
    return () => unregisterDemoNavigationHandler(handler);
  });

  // -----------------------------------------------------------------------
  // Screen driving (the store's ensureScreen driver)
  // -----------------------------------------------------------------------

  /**
   * Navigate the phone's feature/detail, applying the demo's auth
   * transitions: entering tickets from login fast-forwards auth
   * silently; returning to login from a post-auth state restarts the
   * flow. A login-to-login navigate does NOT reset (rewinds within
   * the flow go through runAdvance so forward scrolling never replays
   * stages already reached).
   *
   * Translates the outer-page sentinel to the real ticket ID at
   * the boundary before passing to the router.
   */
  async function internalNavigate(
    feature: DemoFeature,
    detail: DemoDetail,
  ): Promise<void> {
    if (feature !== "login" && router.feature === "login") {
      // Fast-forward crypto BEFORE mounting the target route. The org
      // decrypt path guards on OrgKeyManager.isLoaded, which is not
      // reactive (the product guarantees key load precedes page mounts),
      // so a route mounted pre-keyed would stay scrambled forever.
      // Awaiting here restores the product's ordering guarantee.
      // Eager keying usually makes this resolve instantly; when it
      // does not (slow device, fast scroll past the prewarm lead),
      // the pending counter reveals the preparing overlay.
      fastForwardPending += 1;
      try {
        await ensureKeyed();
      } catch {
        // Engine still booting or a raced worker state: navigate anyway.
        // ensureKeyed clears its cached promise on rejection, so the
        // next transition (or the scripted login) retries derivation.
      } finally {
        fastForwardPending -= 1;
      }
      setDemoAuthed(true);
      setLoginStage(null);
    }
    if (feature === "login" && router.feature !== "login") {
      resetLoginFlow();
    }
    router.navigate(feature, sentinelToReal(detail));
  }

  /**
   * Drive the phone to the screen a location resolves to. Navigation
   * is synchronous through the router; login advances and the search
   * overlay are awaited so the store's convergence check that runs
   * after this settles sees the real outcome. Every async step
   * re-checks the token, so a superseding intent or a real tap
   * cancels the chain cleanly.
   */
  async function ensureScreen(cmd: PhoneCommand, token: number): Promise<void> {
    // Coming-soon route slug: resolve it phone-side and navigate via
    // handleGoto so the router picks up the real pathname and routeId.
    // Parameterized routes (containing "[") are skipped because the
    // slug carries no param values; the convergence check snaps the
    // location back to the phone, which is the designed failure mode.
    if (cmd.routeSlug !== null) {
      const resolvedRouteId = routeForSlug(cmd.routeSlug, listRouteIds());
      if (resolvedRouteId !== null && !resolvedRouteId.includes("[")) {
        const pathname = pathnameForRouteId(resolvedRouteId);

        // The post-login fast-forward: if the phone is still on login,
        // run the same auth transition that internalNavigate provides
        // before issuing the goto.
        if (router.feature === "login") {
          await internalNavigate("home", null);
        }
        router.handleGoto(pathname);
      }
      return;
    }

    if (cmd.openSearch) {
      if (router.feature !== "tickets" || router.detail !== null) {
        await internalNavigate("tickets", null);
      }
      if (!router.searchOpen) {
        findSearchButton()?.click();
        // The toggle reaches the router through Konsta's event; wait
        // for it so the convergence check sees the open overlay.
        await waitFor(() => router.searchOpen, token, POLL_TIMEOUT_SHORT_MS);
      }
    } else {
      // Translate sentinels at the phone boundary: if the engine
      // is not ready yet when a detail navigation arrives, fall back
      // to the list rather than navigating to a dead ID.
      const targetDetail = sentinelToReal(cmd.detail, "null");
      // Skip the navigation when the phone effectively shows the
      // target already. This matters at desktop width: a ticket
      // detail lives at /tickets with page.state.ticketId (split
      // view), and re-navigating to /tickets/[id] replays the
      // client's redirect on every sub selection.
      const alreadyThere =
        router.feature === cmd.feature &&
        effectiveDetail === targetDetail &&
        !router.searchOpen;
      if (!alreadyThere) {
        await internalNavigate(cmd.feature, targetDetail);
      }
      if (cmd.loginTarget !== null) {
        await runAdvance(cmd.loginTarget, token);
      }
    }

    if (cmd.pulseTopic !== null && !store.isStale(token)) {
      void handlePulse(cmd.pulseTopic);
    }
  }

  /**
   * Resolve the search button's aria-label via the paraglide message
   * the AppShell actually uses (m.nav_search), across all locales.
   * Labels are pre-computed once per call, not per candidate.
   */
  function findSearchButton(): HTMLElement | null {
    const searchLabels = locales.map((locale) => m.nav_search({}, { locale }));
    const buttons = document.querySelectorAll<HTMLElement>(
      '[role="button"][aria-label]',
    );
    for (const btn of buttons) {
      const label = btn.getAttribute("aria-label") ?? "";
      if (searchLabels.some((sl) => label === sl)) {
        return btn;
      }
    }
    return null;
  }

  // -----------------------------------------------------------------------
  // Bridge implementation
  // -----------------------------------------------------------------------

  // Intentionally non-reactive: listener membership must not trigger the
  // notification $effect. New listeners receive the current snapshot
  // immediately via subscribe(); the effect fires only on state changes.
  let listeners: readonly DemoBridgeListener[] = [];

  function buildSnapshot(): DemoBridgeState {
    return {
      feature: router.feature,
      detail: effectiveDetail,
      searchOpen: router.searchOpen,
      topic: store.topic,
      loginStage,
      routeId: router.routeId,
      location: store.location,
      origin: store.origin,
      locationSeq: store.locationSeq,
      restartSeq: router.restartSeq,
      engineReady: engineReady,
      role: currentRole,
    };
  }

  const bridge: DemoBridge = {
    setLocation(
      sectionId: SectionId,
      subSlug: string | null,
      origin: PageOrigin,
    ): void {
      store.setLocation(sectionId, subSlug, origin);
    },

    completeLogin(): void {
      if (router.feature !== "login") return;
      // Follow mode: no location pin, so the narrative streams through
      // the stages as the phone plays the flow and lands on tickets
      // when the phone does.
      void runAdvance("done", store.beginFollowChain());
    },

    setDark(value: boolean): void {
      dark = value;
    },

    setRole(role: RoleIdValue): void {
      if (resolvedEngine === null || role === currentRole) return;
      const engine = resolvedEngine;
      void (async (): Promise<void> => {
        // 1. Mutate the DB row and refresh the cached context user.
        //    requireRole middleware enforces the new role from this point.
        //    The engine reads the new role's permission set back through
        //    auth.me, so client gates derive from the same ROLE_CONFIG
        //    the middleware enforces.
        const permissions = await engine.setSignedInRole(role);
        // 2. Update the reactive stub so $derived consumers re-derive.
        setRoleAndPermissions(role, new Set(permissions));
        currentRole = role;
        // 3. Invalidate all query caches. The demo QueryClient uses
        //    staleTime: Infinity and refetchOnMount: false, so a plain
        //    invalidateQueries with the default refetchType ("active")
        //    only refetches ACTIVE observers. Surfaces mounted after the
        //    switch would hit the stale cache and never refetch. Using
        //    resetQueries removes the data entirely so the next mount
        //    triggers a fresh fetch regardless of staleTime/refetchOnMount.
        await queryClient.resetQueries();
      })();
    },

    subscribe(listener: DemoBridgeListener): () => void {
      listeners = [...listeners, listener];

      // Immediately invoke with current state
      listener(buildSnapshot());

      return () => {
        listeners = listeners.filter((entry) => entry !== listener);
      };
    },

    subscribeFlow(listener: DemoFlowListener): () => void {
      return subscribeFlowEvents(listener);
    },
  };

  // Publish to window so the outer page can read it from
  // iframe.contentWindow.demoBridge after the iframe loads.
  window.demoBridge = bridge;

  // Notify listeners on router, store, and stage changes
  $effect(() => {
    const snapshot = buildSnapshot();
    for (const listener of listeners) {
      listener(snapshot);
    }
  });

  // -----------------------------------------------------------------------
  // Login advance chain
  // -----------------------------------------------------------------------

  /** Message function producing each method's picker/alt-button label. */
  const METHOD_LABELS: Record<
    | "method-totp"
    | "method-passkey"
    | "method-email"
    | "method-sms"
    | "method-push"
    | "method-backup",
    (opts: { locale: DemoLocale }) => string
  > = {
    "method-totp": (opts) => m.twofa_totp_label({}, opts),
    "method-passkey": (opts) => m.twofa_passkey_use({}, opts),
    "method-email": (opts) => m.twofa_email_label({}, opts),
    "method-sms": (opts) => m.twofa_sms_label({}, opts),
    "method-push": (opts) => m.twofa_push_label({}, opts),
    "method-backup": (opts) => m.twofa_backup_codes_enter({}, opts),
  };

  function isMethodTarget(
    target: LoginAdvanceTarget,
  ): target is keyof typeof METHOD_LABELS {
    return target.startsWith("method-");
  }

  // Remount key for the login scene; incrementing discards the mounted
  // login page's internal phase state (the only way to rewind it).
  let loginEpoch = $state(0);

  /** Reset the whole login flow to the pre-auth form. */
  function resetLoginFlow(): void {
    setDemoAuthed(false);
    resetLoginStage();
    loginEpoch += 1;
  }

  /** A chain step is stale once its token is superseded (a newer
   *  intent or a real tap) or the phone has left the login feature. */
  function advanceStale(token: number): boolean {
    return store.isStale(token) || router.feature !== "login";
  }

  /** Poll a predicate; false on timeout or cancellation. */
  async function waitFor(
    predicate: () => boolean,
    token: number,
    timeoutMs: number,
  ): Promise<boolean> {
    const result = await pollUntil<true>({
      probe: () => (predicate() ? true : null),
      isStale: () => store.isStale(token),
      timeoutMs,
    });
    return result !== null;
  }

  /** Wait for a specific login stage; false on timeout or cancellation. */
  async function waitForStage(
    targetStage: LoginStage,
    token: number,
    timeoutMs: number = POLL_TIMEOUT_STANDARD_MS,
  ): Promise<boolean> {
    return waitFor(() => getLoginStage() === targetStage, token, timeoutMs);
  }

  /** Poll for a selector; null on timeout or cancellation. */
  async function waitForSelector(
    selector: string,
    token: number,
    timeoutMs: number = POLL_TIMEOUT_MEDIUM_MS,
  ): Promise<HTMLElement | null> {
    return pollUntil<HTMLElement>({
      probe: () => document.querySelector<HTMLElement>(selector),
      isStale: () => advanceStale(token),
      timeoutMs,
    });
  }

  async function runAdvance(
    target: LoginAdvanceTarget,
    token: number,
  ): Promise<void> {
    const current = getLoginStage() ?? "form";
    const decision = evaluateAdvance(current, target, isPacedLoginInFlight());
    if (decision === "drop" || decision === "already") return;
    if (decision === "rewind") {
      resetLoginFlow();
    }

    if (target === "form") return;

    // Forward from wherever we are now
    if (getLoginStage() === "form") {
      const submitBtn = await waitForSelector('button[type="submit"]', token);
      if (submitBtn === null || advanceStale(token)) return;
      submitBtn.click();
      const reached = await waitForStage("twofa-picker", token);
      if (!reached) return;
    }

    if (target === "twofa-picker") return;

    if (isMethodTarget(target)) {
      // Click the method's picker item or alt-method button. When the
      // method is already open, its own control is not rendered (the
      // alternatives list excludes the active method), so a missing
      // control means there is nothing to do.
      const control = await waitForMethodControl(target, token, 1500);
      if (control === null || advanceStale(token)) return;
      control.click();
      return;
    }

    await advanceThroughTwofa(token);

    if (target === "done") {
      await waitForStage("deriving", token);
      // The crypto stub takes ~4.2s; then goto("/") lands on home.
    }
  }

  async function advanceThroughTwofa(token: number): Promise<void> {
    if (getLoginStage() === "deriving") return;

    // If a method is already open, confirm it directly
    if (getLoginStage() !== "twofa-method") {
      // Complete via TOTP (poll: the picker renders asynchronously
      // after auth.login resolves)
      const totpItem = await waitForMethodControl("method-totp", token, 4000);
      if (totpItem === null || advanceStale(token)) return;
      totpItem.click();
      const opened = await waitForStage("twofa-method", token);
      if (!opened) return;
    }

    // The LoginMount observer prefills the code; give it a beat, then
    // submit the method form.
    await new Promise<void>((r) => setTimeout(r, 300));
    if (advanceStale(token)) return;
    const submitBtn = await waitForSelector('button[type="submit"]', token);
    if (submitBtn === null || advanceStale(token)) return;
    submitBtn.click();
  }

  /** Find the clickable control that opens a method: its picker list
   *  item, or the alt-method button shown under an open method. */
  async function waitForMethodControl(
    target: keyof typeof METHOD_LABELS,
    token: number,
    timeoutMs: number,
  ): Promise<HTMLElement | null> {
    // eslint-disable-next-line security/detect-object-injection -- key is a typed keyof typeof METHOD_LABELS
    const messageFn = METHOD_LABELS[target];
    // Hoist the resolved label list so it is computed once per call
    // rather than re-evaluated for every candidate element in find().
    const labels = locales.map((locale) => messageFn({ locale }));

    function find(): HTMLElement | null {
      // Picker items and the alternatives shown under an open method.
      // Deliberately NOT a method page's own confirm button (same
      // label): when only that matches, the method is already open
      // and re-clicking it would re-trigger its action.
      const controls = document.querySelectorAll<HTMLElement>(
        ".k-list-item, button.alt-method-btn, button.backup-code-link",
      );
      for (const control of controls) {
        const text = control.textContent.trim();
        if (text === "") continue;
        const isListItem = control.matches(".k-list-item");
        const matched = isListItem
          ? labels.some((label) => text.includes(label))
          : labels.some((label) => text === label);
        if (matched) return control;
      }
      return null;
    }

    return pollUntil<HTMLElement>({
      probe: find,
      isStale: () => advanceStale(token),
      timeoutMs,
    });
  }

  // -----------------------------------------------------------------------
  // Pulse handler
  // -----------------------------------------------------------------------

  async function handlePulse(pulseTopic: DemoTopic): Promise<void> {
    const { feature, detail } = topicFeatureTarget(pulseTopic);
    // Translate the sentinel at the boundary
    const resolvedDetail = sentinelToReal(detail);

    // Navigate if needed (normally a no-op: ensureScreen already
    // navigated before pulsing)
    if (router.feature !== feature || effectiveDetail !== resolvedDetail) {
      await internalNavigate(feature, resolvedDetail);
      // Wait a frame for the scene to mount
      await new Promise<void>((r) => {
        requestAnimationFrame(() => r());
      });
    }

    // Tap topics get the real interaction (the marker taps the actual
    // control and the app responds); the rest get the marker only.
    let tap = TAP_TOPICS.has(pulseTopic);
    const candidates = tap
      ? buildActivationCandidates(pulseTopic)
      : buildTopicCandidates(pulseTopic);

    let el = findTopicElement(document, candidates);
    el ??= await waitForElement(document, candidates);
    if (el === null && tap) {
      // The specific control is absent (different view state); fall
      // back to marking the broader element without tapping.
      tap = false;
      el = findTopicElement(document, buildTopicCandidates(pulseTopic));
    }

    // Selector fallback: topics whose targets have no matchable label
    if (el === null) {
      const selectorEl = findTopicElementBySelector(document, pulseTopic);
      if (selectorEl !== null) {
        dismissOpenOverlays(selectorEl);
        renderPulseMarker(selectorEl);
        recordPulseOutcome(pulseTopic, "selector");

        // decryption: replay the descramble animation while the marker
        // sits on a DecryptPlaceholder. Clearing the pacing bridge's
        // first-resolution cache and resetting queries causes every
        // visible title to re-scramble and descramble.
        if (pulseTopic === "decryption") {
          replayDescramble();
          await queryClient.resetQueries();
        }

        // Selector fallback never taps (the element is not a labeled control)
        return;
      }
    }

    // --- Special cases (topic-gated, before the standard flow) ---

    // message-actions: the label (ticket_context_menu_title) only exists
    // while the action sheet is open, so el is typically null here. Find
    // a conversation bubble directly and dispatch the product's
    // accessibility keyboard shortcut (Shift+F10) to open the menu.
    if (pulseTopic === "message-actions") {
      const bubble = document.querySelector<HTMLElement>(".fu-wrapper");
      if (bubble !== null) {
        dismissOpenOverlays(bubble);
        renderPulseMarker(bubble);
        recordPulseOutcome(pulseTopic, "tapped");
        setTimeout(() => {
          bubble.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "F10",
              shiftKey: true,
              bubbles: true,
            }),
          );
        }, 250);
      } else {
        recordPulseOutcome(pulseTopic, "missing");
      }
      return;
    }

    // exposure-hints: two-stage click. The compose actions button matches
    // el from the standard candidates. Click it, then wait for the SMS
    // title list item and click it. The real exposure toast appears
    // (ShellToast, role=status). SMS mode activates only when the visitor
    // taps dismiss, so this mutates nothing.
    if (pulseTopic === "exposure-hints" && el !== null) {
      dismissOpenOverlays(el);
      renderPulseMarker(el);
      recordPulseOutcome(pulseTopic, "tapped");
      const clickable = findClickableTarget(el);
      if (clickable !== null) {
        clickable.click();
        const smsCandidates = buildTopicCandidates("exposure-hints");
        const smsEl = await waitForElement(document, smsCandidates);
        if (smsEl !== null) {
          const smsClickable = findClickableTarget(smsEl);
          if (smsClickable !== null) {
            setTimeout(() => {
              smsClickable.click();
            }, 150);
          }
        }
      }
      return;
    }

    if (el === null) {
      recordPulseOutcome(pulseTopic, "missing");
      return;
    }

    // Close whatever a previous activation opened, unless the target
    // lives inside that overlay.
    dismissOpenOverlays(el);

    renderPulseMarker(el);

    // Never tap shell navigation: when only a nav-chrome element
    // matched the label (findTopicElement's last resort), activating
    // it would navigate away from the narrated screen.
    if (tap && isNavChrome(el)) {
      tap = false;
    }

    if (tap) {
      const clickable = findClickableTarget(el);
      // An activation that would navigate to a DIFFERENT feature must
      // not fire: the tap illustrates the narrated screen, and leaving
      // it derails the shared location (at desktop width the dashboard
      // KB heading is a link into the library, for example).
      const anchor = clickable?.closest("a") ?? null;
      const href = anchor?.getAttribute("href") ?? null;
      if (href !== null) {
        const destination = featureForPathname(
          new URL(href, window.location.origin).pathname,
        );
        if (destination !== null && destination !== feature) {
          tap = false;
        }
      }
      if (tap) {
        // Let the marker paint first so the response reads as its effect
        setTimeout(() => {
          clickable?.click();
        }, 150);
      }
    }

    recordPulseOutcome(pulseTopic, tap ? "tapped" : "marked");

    // The language picker is a native select. Browsers only open its
    // dropdown from a user gesture: outer-page clicks count as
    // same-origin activation, pure scrolling does not, and showPicker
    // throws without one. Attempt to open, fall back to focus plus the
    // marker that is already pointing at it.
    if (pulseTopic === "language") {
      const select =
        el instanceof HTMLSelectElement ? el : el.querySelector("select");
      if (select instanceof HTMLSelectElement) {
        setTimeout(() => {
          select.focus();
          try {
            select.showPicker();
          } catch {
            // No transient activation: marker and focus ring stand in
          }
        }, 150);
      }
    }
  }

  // Splash stays while the location store has not been driven by an
  // outer-page intent or phone interaction (origin "init" is the boot
  // baseline). Deep links dismiss it immediately because they commit a
  // non-init origin before the first render. Restart resets the store,
  // so origin returns to "init" and the splash reappears.
  const splashDismissed: boolean = $derived(store.origin !== "init");
</script>

<div class="phone-app">
  <QueryClientProvider client={queryClient}>
    <App theme="ios" {dark} class="app-shell">
      {#if router.feature === "login"}
        {#key loginEpoch}
          <LoginMount />
        {/key}
      {:else}
        <AppShell
          activeTab={router.activeTab}
          activeArea={router.activeArea}
          orgName="CARE-Y"
          ontabchange={(tabId: TabId) => router.handleTabChange(tabId)}
          onareatap={(areaId: AreaId) => router.handleAreaTap(areaId)}
          onsearchtoggle={(open: boolean) => router.handleSearchToggle(open)}
        >
          <RouteMount pathname={routeMountPathname} />
        </AppShell>
      {/if}
    </App>
    {#if fastForwardPending > 0}
      <!-- Shown while a jump past the login scene waits on engine
           boot + key derivation. The reveal is delayed via CSS so the
           usual instant fast-forward (eager keying already done)
           never flashes it. -->
      <div class="fast-forward-overlay" role="status">
        <Preloader class="w-8 h-8" />
        <span>{m.demo_preparing()}</span>
      </div>
    {/if}
    <DemoSplash dismissed={splashDismissed} />
  </QueryClientProvider>
</div>

<style>
  .phone-app {
    height: 100dvh;
  }

  /* Covers the phone screen while a fast-forward waits on the engine
     and key derivation. Fixed inside the iframe, so it spans exactly
     the phone viewport. Sits under the splash (phone.html sets the
     splash z-index higher) and above the app content. */
  .fast-forward-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: #444;
    background: rgb(255 255 255 / 0.88);
    backdrop-filter: blur(4px);
    /* Delayed reveal: instant fast-forwards never show it. */
    opacity: 0;
    animation: fast-forward-reveal 200ms ease 300ms forwards;
  }

  :global(.dark) .fast-forward-overlay {
    color: #ccc;
    background: rgb(10 10 10 / 0.82);
  }

  @keyframes fast-forward-reveal {
    to {
      opacity: 1;
    }
  }

  /* Mirror the client root layout (+layout.svelte lines 84-105).
     The demo does not mount that layout, so these globals replicate
     the production constraints for Konsta's shell components. */

  /* Constrain App to viewport for iOS Safari. Page is a non-scrolling
     flex frame. Navbar sits at the top, Tabbar is fixed bottom.
     Scrolling lives on <main> inside AppShell. */
  :global(.app-shell) {
    height: 100dvh;
    min-height: auto;
    overflow: hidden;
  }

  /* Push the shell below the status bar overlay at phone-sized viewports.
     The DemoFrame status bar renders only below 768px; this inset must
     match that threshold so the content clears the overlay exactly when
     it is visible. At tablet/desktop widths the overlay is hidden and
     the inset resets to 0 (Konsta's env() default). */
  @media (max-width: 767px) {
    .phone-app :global(.app-shell) {
      --k-safe-area-top: 59px;
    }
  }

  /* Page is a non-scrolling flex frame. Scrolling moves to <main> inside
     AppShell so each route gets independent scroll isolation. Navbar sits
     at the top as a flex child; Toolbar is position:fixed, unaffected. */
  :global(.k-page) {
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
  }

  /* Dark mode: paper texture on the page canvas.
     Cards sit above (Konsta Block has z-10). */
  :global(.dark .k-page) {
    isolation: isolate;
  }

  /* A real phone shows overlay scroll indicators only while scrolling;
     desktop browsers paint persistent scrollbars inside the iframe.
     Hide them everywhere in the phone document. Scrolling itself is
     unaffected. */
  .phone-app :global(*) {
    scrollbar-width: none;
  }

  .phone-app :global(*::-webkit-scrollbar) {
    display: none;
  }
</style>
