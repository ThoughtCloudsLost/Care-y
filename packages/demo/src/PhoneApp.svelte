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
  import { splitHandoffId } from "$lib/stores/split-handoff.svelte.js";
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
  import { splashCovers } from "$demo/boot-landing.js";
  import { listRouteIds } from "$demo/engine/route-manifest.js";
  import {
    demoSeed,
    ensureKeyed,
    setRoleAndPermissions,
    replayDescramble,
  } from "$lib/crypto/context.js";
  import { isPacedLoginInFlight } from "./stubs/login-crypto.js";
  import { sealSeedFilterNames } from "./stubs/saved-filters.svelte.js";
  import { RoleId, type RoleIdValue } from "@care-y/shared";
  import {
    classifyDemoLabel,
    type DemoLocale,
  } from "$demo/topic-classifier.js";
  import {
    locales,
    setLocale as setPhoneLocale,
    getTextDirection,
    type Locale,
  } from "$lib/paraglide/runtime.js";
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
    buildSmsTitleCandidates,
    buildReplyTitleCandidates,
    buildComposeDismissCandidates,
    buildCloseReopenCandidates,
    findClickableTarget,
    isStrictShellNav,
    isSectionToggleCollapsing,
    dismissOpenOverlays,
    waitForElement,
    resolveTopicElement,
    resolveSelectorElement,
    renderPulseMarker,
    TAP_TOPICS,
    MODE_TOGGLE_TOPICS,
    closeModeToggle,
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
    buildFlowDetail,
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
      // Seal the saved-filter seed names to the org public key so the
      // OrgDecryptCache can decrypt them via the real crypto worker.
      sealSeedFilterNames(e.seedResult.orgPublicKey);

      resolvedEngine = e;
      engineReady = true;
      // Eager keying: start the real derivation the moment the engine
      // is up, so the first login-to-elsewhere fast-forward (and every
      // queued decrypt) finds the worker already keyed instead of
      // paying Argon2id at navigation time. The iframe mounts eagerly
      // on page load, so the derivation spends itself against reading
      // time on the entry page. The phone RESTS behind the splash:
      // no navigation and no sign-in happen here. The first real
      // navigation (section click, deep link) goes through the
      // internalNavigate fast-forward, which awaits this same
      // ensureKeyed promise (instant once settled), signs in, and
      // jumps straight to the target. keyedDone only gates the
      // splash, and flips on failure too so a broken boot degrades
      // to a visible screen instead of an eternal splash (the
      // fast-forward path retries derivation).
      void ensureKeyed()
        .then(() => {
          settleBackgroundLogin();
        })
        .catch(() => {
          settleBackgroundLogin();
        });
    })
    .catch(() => {
      // Boot failure already surfaced by phone-main.ts console.error.
      // engineReady stays false so the peek keeps showing a blurred still.
      keyedDone = true;
    });

  // Flips when the background login settles (success or failure).
  // Gates the splash; resets naturally on restart (iframe reload).
  let keyedDone = $state(false);

  /**
   * Settle the background login. A deep link or click that landed
   * while the phone was still keying may have ended its drive chain
   * unconverged (phone-corrections are suppressed behind the splash),
   * so re-select the standing location to drive the phone to it now
   * that keys are warm. The login section is left to its scripted
   * flow, and origin "init" means nothing was chosen yet: the phone
   * keeps resting behind the splash until the first navigation.
   */
  function settleBackgroundLogin(): void {
    keyedDone = true;
    if (store.origin === "init") return;
    if (store.location.sectionId === "login") return;
    const reOrigin: PageOrigin =
      store.origin === "deep-link" ? "deep-link" : "page-click";
    store.setLocation(
      store.location.sectionId,
      store.location.subSlug,
      reOrigin,
    );
  }

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
  //
  // The handoff fallback covers the frames mid-switch, where the
  // pathname has already dropped the id but page state has not taken
  // it up yet. Switching frame presets crosses that window every time,
  // and without the fallback the story visibly bounces off the list
  // section on the way through.
  const splitViewTicketId = $derived.by((): string | null => {
    if (router.feature !== "tickets" || router.detail !== null) return null;
    const id = demoPage.state.ticketId;
    if (typeof id === "string" && id !== "") return id;
    return splitHandoffId("tickets");
  });
  // The library does the same dance: /library/[articleId] redirects to
  // /library and carries the article in page.state.articleId, so a
  // desktop vote narration would otherwise snap back to browsing.
  const splitViewArticleId = $derived.by((): string | null => {
    if (router.feature !== "library" || router.detail !== null) return null;
    const id = demoPage.state.articleId;
    if (typeof id === "string" && id !== "") return id;
    return splitHandoffId("library");
  });
  const effectiveDetail = $derived(
    router.detail ?? splitViewTicketId ?? splitViewArticleId,
  );

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
    isBootSettled: () => keyedDone,
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

  // The last pulse-opened inline mode awaiting its exit. Deliberately
  // non-reactive: only location changes should run the closing effect,
  // never the registration itself (which happens while still ON the
  // registering sub).
  let pendingModeExit: {
    topic: DemoTopic;
    sectionId: SectionId;
    subSlug: string | null;
    control: HTMLElement | null;
  } | null = null;

  // Close a pulse-opened inline mode (in-page search, selection mode,
  // reply compose bar) once the story leaves the sub whose pulse
  // opened it. The mode stays visible while its own narration is on
  // screen, and a visitor's manually opened modes are never touched
  // (only pulses register an exit).
  $effect(() => {
    const sectionId = store.location.sectionId;
    const subSlug = store.location.subSlug;
    if (pendingModeExit === null) return;
    if (
      pendingModeExit.sectionId === sectionId &&
      pendingModeExit.subSlug === subSlug
    ) {
      return;
    }
    const exit = pendingModeExit;
    pendingModeExit = null;
    // Past the pulse's own 150ms click schedule, so a fast sub change
    // cannot close the mode before it opened.
    setTimeout(() => {
      if (exit.topic === "reply") {
        // Collapse the compose bar the demo opened by clicking the
        // dismiss control (TicketCompose.svelte:151-157). dismissCompose
        // clears the active mode's draft (the demo's sample text) and
        // collapses. This discards the demo-typed text without wiping a
        // visitor's own draft for a different mode.
        closeReplyCompose();
      } else {
        closeModeToggle(exit.topic, exit.control);
      }
    }, 250);
  });

  /** Click the compose dismiss button to collapse the reply bar. */
  function closeReplyCompose(): void {
    const dismissCandidates = buildComposeDismissCandidates();
    const buttons = document.querySelectorAll<HTMLElement>(
      'button, [role="button"]',
    );
    for (const btn of buttons) {
      const label = btn.getAttribute("aria-label") ?? "";
      if (dismissCandidates.has(label)) {
        btn.click();
        return;
      }
    }
  }

  // -----------------------------------------------------------------------
  // Topic classification (with accessible-text fallback)
  // -----------------------------------------------------------------------

  // Capture-phase click listener on the phone document. Walks the
  // event target up to the nearest [aria-label] element and classifies
  // the label string to a DemoTopic via the pure classifier. Falls
  // back to text content for interactive elements without aria-labels.
  // The topic of the most recent pulse. Synthetic clicks are pulse
  // choreography: a pulse may click a control whose label classifies
  // as a DIFFERENT topic (the exposure-hints pulse opens the compose
  // actions popover), and reporting that raw classification yanks the
  // story off the narrated sub. Synthetic clicks therefore report the
  // owning pulse's topic; a trusted visitor tap clears the override
  // so the visitor's own interactions classify normally again.
  let activePulseTopic: DemoTopic | null = null;

  /** Record a classified interaction; real visitor taps on the push
   *  method also arm its challenge to approve (synthetic scroll-driven
   *  opens never do, so the waiting screen alone cannot log in). */
  function applyTopic(classified: DemoTopic, trusted: boolean): void {
    if (!trusted && activePulseTopic !== null) {
      store.reportTopic(activePulseTopic);
      return;
    }
    store.reportTopic(classified);
    if (trusted) {
      emitFlowEvent({
        lane: "ui",
        direction: "up",
        label: `tap ${classified}`,
        detail: buildFlowDetail({
          input: [
            { name: "topic", value: classified, kind: "identifier" },
            { name: "classified", value: "yes", kind: "metadata" },
          ],
        }),
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
        // The visitor took over: their clicks classify normally again.
        activePulseTopic = null;
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
          detail: buildFlowDetail({
            input: [{ name: "classified", value: "no", kind: "metadata" }],
          }),
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
      // Desktop-only subs (split-view) are skipped entirely at phone
      // width, recording nothing so the e2e suite can skip them too.
      if (
        cmd.pulseDesktopOnly &&
        !window.matchMedia("(min-width: 1024px)").matches
      ) {
        return;
      }
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

    setLocale(locale: Locale): void {
      void setPhoneLocale(locale);
      document.documentElement.lang = locale;
      document.documentElement.dir = getTextDirection(locale);
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
    // Own all synthetic clicks until the next pulse or a visitor tap:
    // the pulse's choreography clicks report this topic, never their
    // raw classification (see applyTopic).
    activePulseTopic = pulseTopic;
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

    // Use the two-tier resolver: strict first (in-viewport), then
    // loose (below the fold). A loose hit is scrolled into view
    // automatically before the resolver returns.
    let el = await resolveTopicElement(document, candidates);
    if (el === null && tap) {
      // The specific control is absent (different view state); fall
      // back to marking the broader element without tapping.
      tap = false;
      el = await resolveTopicElement(
        document,
        buildTopicCandidates(pulseTopic),
      );
    }

    // Selector fallback: topics whose targets have no matchable label.
    // Uses the same strict-then-loose strategy with scroll.
    if (el === null) {
      const selectorEl = await resolveSelectorElement(document, pulseTopic);
      if (selectorEl !== null) {
        dismissOpenOverlays(selectorEl);
        renderPulseMarker(selectorEl);
        recordPulseOutcome(pulseTopic, "selector", selectorEl);

        // Selector fallback never taps (the element is not a labeled control)
        return;
      }
    }

    // --- Special cases (topic-gated, before the standard flow) ---

    // decryption: replay the descramble animation unconditionally.
    // The phone signs in during boot, so the list is already decrypted
    // and no busy placeholders exist on entry. The replay clears the
    // pacing bridge's first-resolution cache and resets queries,
    // causing every visible title to re-scramble and descramble.
    // After the replay starts, poll for a busy placeholder to appear
    // and render the pulse marker on it. If the replay raced a fast
    // decrypt (no placeholder appeared), fall back to the first ticket
    // card.
    if (pulseTopic === "decryption") {
      dismissOpenOverlays(null);
      replayDescramble();
      await queryClient.resetQueries();

      // Poll for a DecryptPlaceholder's busy indicator to appear
      const busyEl = await pollUntil<HTMLElement>({
        probe: () =>
          document.querySelector<HTMLElement>(
            '[role="status"][aria-busy="true"]',
          ),
        timeoutMs: POLL_TIMEOUT_SHORT_MS,
      });

      if (busyEl !== null) {
        renderPulseMarker(busyEl);
        recordPulseOutcome(pulseTopic, "selector", busyEl);
      } else {
        // Fast decrypt raced past the scramble; mark the first ticket card
        const cardEl = document.querySelector<HTMLElement>(
          '[data-testid="ticket-card"]',
        );
        if (cardEl !== null) {
          renderPulseMarker(cardEl);
          recordPulseOutcome(pulseTopic, "selector", cardEl);
        } else {
          recordPulseOutcome(pulseTopic, "missing");
        }
      }
      return;
    }

    // message-actions: the label (ticket_context_menu_title) only exists
    // while the action sheet is open, so el is typically null here. Find
    // a conversation bubble directly and dispatch the product's
    // accessibility keyboard shortcut (Shift+F10) to open the menu.
    if (pulseTopic === "message-actions") {
      const bubble = document.querySelector<HTMLElement>(".fu-wrapper");
      if (bubble !== null) {
        dismissOpenOverlays(bubble);
        renderPulseMarker(bubble);
        recordPulseOutcome(pulseTopic, "tapped", bubble);
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
      recordPulseOutcome(pulseTopic, "tapped", el);
      const clickable = findClickableTarget(el);
      if (clickable !== null) {
        clickable.click();
        // Search for the SMS entry alone: the full exposure candidates
        // include the compose actions label, and the aria pass would
        // resolve the still-visible compose button before the popover
        // mounts, re-toggling the popover instead of selecting SMS.
        const smsCandidates = buildSmsTitleCandidates();
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

    // reply: three-stage choreography. Stage 1: click the compose
    // actions button. Stage 2: wait for the popover's Reply entry
    // (ComposeActions.svelte:98-106, ticket_reply_to_client) and click
    // it, which calls activateReply and expands the messagebar.
    // Stage 3: set a sample draft in the expanded textarea so the send
    // button and character affordances show.
    if (pulseTopic === "reply" && el !== null) {
      dismissOpenOverlays(el);
      renderPulseMarker(el);
      const clickable = findClickableTarget(el);
      if (clickable !== null) {
        clickable.click();
        const replyCandidates = buildReplyTitleCandidates();
        const replyEl = await waitForElement(document, replyCandidates);
        if (replyEl !== null) {
          const replyClickable = findClickableTarget(replyEl);
          if (replyClickable !== null) {
            await new Promise<void>((r) => setTimeout(r, 150));
            replyClickable.click();
            // Wait for the messagebar textarea to mount
            // (ShellMessagebar.svelte:164-168 renders a Konsta Messagebar
            // whose textarea is inside .shell-messagebar-anchor).
            await new Promise<void>((r) => setTimeout(r, 300));
            const textarea = document.querySelector<HTMLTextAreaElement>(
              ".shell-messagebar-anchor textarea",
            );
            if (textarea !== null) {
              // Svelte's bind:value reads the element value on the
              // input event, so direct assignment plus a dispatched
              // InputEvent updates the binding.
              textarea.value = m.demo_compose_sample();
              textarea.dispatchEvent(
                new InputEvent("input", { bubbles: true }),
              );
            }
          }
        }
      }
      recordPulseOutcome(pulseTopic, "tapped", el);
      // Register cleanup: when the story leaves this sub, collapse the
      // compose bar the demo opened. Uses the dismiss control
      // (TicketCompose.svelte:151-157, ticket_compose_dismiss_mode)
      // which clears the active mode's draft (the demo's own text)
      // and collapses without wiping a visitor's stored draft for the
      // other mode. This is preferred over reset() because the demo
      // typed sample text that should not persist.
      pendingModeExit = {
        topic: pulseTopic,
        sectionId: store.location.sectionId,
        subSlug: store.location.subSlug,
        control: clickable,
      };
      return;
    }

    // close-reopen: open the more-actions panel, then mark (do not
    // click) the close/reopen action inside it. The panel-opening
    // click is the demonstration; the next pulse's dismissOpenOverlays
    // closes the panel. (TicketPanelContent.svelte:291-305)
    if (pulseTopic === "close-reopen" && el !== null) {
      dismissOpenOverlays(el);
      renderPulseMarker(el);
      const clickable = findClickableTarget(el);
      if (clickable !== null) {
        clickable.click();
        // Wait for the panel content to mount, then find the
        // close/reopen action inside it.
        const actionEl = await waitForElement(
          document,
          buildCloseReopenCandidates(),
        );
        if (actionEl !== null) {
          // Mark the action visually but do not click it: closing or
          // reopening would mutate the ticket state.
          renderPulseMarker(actionEl);
        }
      }
      recordPulseOutcome(pulseTopic, "tapped", el);
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

    // Never tap strict shell navigation (sidebar, tabbar, nav
    // landmarks): activating it would navigate away from the narrated
    // screen. Content-level tablists (IconTabToggle with semantics
    // "tabs") are allowed because switching a tab within the narrated
    // screen IS the demonstration.
    if (tap && isStrictShellNav(el)) {
      tap = false;
    }

    // Never tap a collapse toggle that would COLLAPSE an already-
    // expanded section: collapsing hides the very content the narration
    // is describing. When the section is currently collapsed, tapping
    // EXPANDS it, which is the demonstration (dashboard-unassigned,
    // dashboard-on-hold are collapsed by default).
    if (tap && isSectionToggleCollapsing(el)) {
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

      // Also guard the clickable itself against collapse toggles that
      // would collapse: findClickableTarget may have walked into a
      // toggle ancestor.
      if (tap && clickable !== null && isSectionToggleCollapsing(clickable)) {
        tap = false;
      }

      if (tap) {
        // Let the marker paint first so the response reads as its effect
        setTimeout(() => {
          clickable?.click();
        }, 150);
        // A tap that switches ON a persistent inline mode (in-page
        // search, selection mode) registers its exit; the effect
        // below closes the mode when the story leaves this sub.
        if (MODE_TOGGLE_TOPICS.has(pulseTopic)) {
          pendingModeExit = {
            topic: pulseTopic,
            sectionId: store.location.sectionId,
            subSlug: store.location.subSlug,
            control: clickable,
          };
        }
      }
    }

    recordPulseOutcome(pulseTopic, tap ? "tapped" : "marked", el);

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

  // Splash covers the resting phone and lifts only when the router is
  // actually showing a non-login screen after the background login
  // settles, so the login screens are never visible outside the login
  // section (whose narration lifts it early). Restart reloads the
  // iframe, which resets keyedDone and brings the splash back.
  const splashDismissed: boolean = $derived(
    !splashCovers(
      keyedDone,
      router.feature,
      store.location.sectionId,
      store.origin,
    ),
  );
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
    {#if !splashDismissed}
      <!-- Boot narration over the splash (splash z-index is 99999;
           the fast-forward overlay carrying the same message sits
           UNDER it and is invisible during boot). The reveal is
           CSS-delayed 600ms so a fast boot never flashes it;
           visitors who wait learn why they wait. -->
      <div class="boot-status" role="status">
        <span class="boot-status-spinner" aria-hidden="true"></span>
        <span>{m.demo_preparing()}</span>
      </div>
    {/if}
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

  /* Boot narration over the splash (z-index above the injected
     splash's 99999). Same delayed-reveal pattern as the fast-forward
     overlay, longer delay: sub-600ms boots never show it. */
  .boot-status {
    position: fixed;
    inset: auto 0 12%;
    z-index: 100000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 0 2rem;
    text-align: center;
    font-size: 0.8125rem;
    line-height: 1.4;
    color: #666;
    opacity: 0;
    animation: fast-forward-reveal 400ms ease 600ms forwards;
  }

  :global(.dark) .boot-status {
    color: #aaa;
  }

  .boot-status-spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation:
      fast-forward-reveal 400ms ease 600ms forwards,
      boot-status-spin 0.9s linear infinite;
    opacity: 0;
  }

  @keyframes boot-status-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .boot-status-spinner {
      animation: fast-forward-reveal 400ms ease 600ms forwards;
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

  /* Simulate device safe areas at phone-sized viewports. DemoFrame
     renders a status bar (top) and home indicator (bottom) only below
     768px; these insets match that threshold. At tablet/desktop widths
     the overlays are hidden and insets reset to 0 (Konsta env() default). */
  @media (max-width: 767px) {
    .phone-app :global(.app-shell) {
      --k-safe-area-top: 59px;
      --k-safe-area-bottom: 34px;
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
