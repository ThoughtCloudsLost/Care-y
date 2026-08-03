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
  import { App } from "konsta/svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import {
    registerDemoNavigationHandler,
    unregisterDemoNavigationHandler,
  } from "$app/navigation";
  import * as m from "$lib/paraglide/messages.js";
  import { locales } from "$lib/paraglide/runtime.js";
  import type { TabId, AreaId } from "$lib/shell/types.js";
  import AppShell from "$lib/shell/AppShell.svelte";
  import DemoSplash from "$demo/DemoSplash.svelte";
  import LoginMount from "$demo/scenes/LoginMount.svelte";
  import RouteMount from "$demo/engine/RouteMount.svelte";
  import { createDemoRouter } from "$demo/router.svelte.js";
  import { createDemoQueryClient } from "$demo/demo-query-client.js";
  import { createDemoLocationStore } from "$demo/demo-location.svelte.js";
  import type { PhoneCommand } from "$demo/scroll-sections.js";
  import { routeForSlug } from "$demo/scroll-sections.js";
  import { listRouteIds } from "$demo/engine/route-manifest.js";
  import { demoSeed, ensureKeyed } from "$lib/crypto/context.js";
  import { RoleId } from "@care-y/shared";
  import { classifyDemoLabel } from "$demo/topic-classifier.js";
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
    findClickableTarget,
    dismissOpenOverlays,
    waitForElement,
    renderPulseMarker,
    TAP_TOPICS,
  } from "$demo/tap-pulse.js";
  import {
    DEMO_DETAIL_TICKET_ID,
    DEMO_DETAIL_ARTICLE_ID,
  } from "$demo/bridge.js";
  import {
    activateSettingsDriver,
    deactivateSettingsDriver,
  } from "$demo/settings-driver.js";
  import type { DemoEngineResult } from "$demo/engine/engine.js";
  import { onOutboxAppend } from "$demo/engine/outbox.js";
  import type {
    DemoBridge,
    DemoBridgeListener,
    DemoBridgeState,
    DemoFeature,
    DemoDetail,
    DemoTopic,
    LoginStage,
    LoginAdvanceTarget,
    SectionId,
    PageOrigin,
  } from "$demo/bridge.js";

  // -----------------------------------------------------------------------
  // Props
  // -----------------------------------------------------------------------

  let { engineReady }: { engineReady: Promise<DemoEngineResult> } = $props();

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
  let engineBooted = $state(false);

  // The real article ID for the library vote sub-section, resolved
  // once the engine boots.
  let resolvedArticleId: string | null = $state(null);

  /**
   * Map the outer-page sentinel to the real ID. Returns the real
   * ID when the sentinel is passed and the engine has resolved,
   * or the original detail value otherwise.
   */
  function sentinelToReal(detail: DemoDetail): DemoDetail {
    if (detail === DEMO_DETAIL_TICKET_ID && resolvedDetailId !== null) {
      return resolvedDetailId;
    }
    if (detail === DEMO_DETAIL_ARTICLE_ID && resolvedArticleId !== null) {
      return resolvedArticleId;
    }
    return detail;
  }

  // Seed crypto-context and resolve the detail IDs once the engine
  // finishes booting. Failures are already logged by phone-main.ts;
  // we catch here to avoid an unhandled rejection inside the component.
  //
  // engineReady is a Promise prop set once at mount; capturing the
  // initial value is intentional (the prop never changes).
  // svelte-ignore state_referenced_locally
  void engineReady
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
      engineBooted = true;
    })
    .catch(() => {
      // Boot failure already surfaced by phone-main.ts console.error.
      // engineBooted stays false so the peek keeps showing a blurred still.
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
  // Location store (canonical state owner)
  // -----------------------------------------------------------------------

  const store = createDemoLocationStore({
    getPhone: () => ({
      feature: router.feature,
      detail: router.detail,
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
    void router.detail;
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
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const inDetail = router.detail !== null;
      const ctx = { inDetail, feature: router.feature };

      // Try aria-label first
      const labeled = target.closest("[aria-label]");
      if (labeled !== null) {
        const ariaLabel = labeled.getAttribute("aria-label");
        if (ariaLabel !== null && ariaLabel !== "") {
          const classified = classifyDemoLabel(ariaLabel, ctx);
          if (classified !== null) {
            applyTopic(classified, event.isTrusted);
            return;
          }
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
      try {
        await ensureKeyed();
      } catch {
        // Engine still booting or a raced worker state: navigate anyway.
        // ensureKeyed clears its cached promise on rejection, so the
        // next transition (or the scripted login) retries derivation.
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
        // Strip group segments to build a navigable pathname.
        const pathname =
          resolvedRouteId
            .split("/")
            .filter((s) => !(s.startsWith("(") && s.endsWith(")")))
            .join("/") || "/";

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
        await waitFor(() => router.searchOpen, token, 1500);
      }
    } else {
      // Translate sentinels at the phone boundary: if the engine
      // is not ready yet when a detail navigation arrives, fall back
      // to the list rather than navigating to a dead ID.
      let targetDetail = cmd.detail;
      if (targetDetail === DEMO_DETAIL_TICKET_ID) {
        if (resolvedDetailId !== null) {
          targetDetail = resolvedDetailId;
        } else {
          targetDetail = null;
        }
      } else if (targetDetail === DEMO_DETAIL_ARTICLE_ID) {
        if (resolvedArticleId !== null) {
          targetDetail = resolvedArticleId;
        } else {
          targetDetail = null;
        }
      }
      await internalNavigate(cmd.feature, targetDetail);
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
   */
  function findSearchButton(): HTMLElement | null {
    for (const locale of locales) {
      const label = m.nav_search({}, { locale });
      const btn = document.querySelector<HTMLElement>(
        `[role="button"][aria-label="${CSS.escape(label)}"]`,
      );
      if (btn !== null) return btn;
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
      detail: router.detail,
      searchOpen: router.searchOpen,
      topic: store.topic,
      loginStage,
      routeId: router.routeId,
      location: store.location,
      origin: store.origin,
      locationSeq: store.locationSeq,
      restartSeq: router.restartSeq,
      engineReady: engineBooted,
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

    subscribe(listener: DemoBridgeListener): () => void {
      listeners = [...listeners, listener];

      // Immediately invoke with current state
      listener(buildSnapshot());

      return () => {
        listeners = listeners.filter((entry) => entry !== listener);
      };
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

  // Stage ordering for rewind decisions. Targets rank alongside stages;
  // "done" outranks everything so it always plays forward to the end.
  const STAGE_RANK: Record<LoginStage, number> = {
    form: 0,
    "twofa-picker": 1,
    "twofa-method": 2,
    deriving: 3,
  };
  const TARGET_RANK: Record<LoginAdvanceTarget, number> = {
    form: 0,
    "twofa-picker": 1,
    "method-totp": 2,
    "method-passkey": 2,
    "method-email": 2,
    "method-sms": 2,
    "method-push": 2,
    "method-backup": 2,
    deriving: 3,
    done: 4,
  };

  /** Message function producing each method's picker/alt-button label. */
  type DemoLocale = (typeof locales)[number];
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
    return new Promise<boolean>((resolve) => {
      if (predicate()) {
        resolve(true);
        return;
      }
      let elapsed = 0;
      const timer = setInterval(() => {
        elapsed += 100;
        if (store.isStale(token)) {
          clearInterval(timer);
          resolve(false);
          return;
        }
        if (predicate()) {
          clearInterval(timer);
          resolve(true);
          return;
        }
        if (elapsed >= timeoutMs) {
          clearInterval(timer);
          resolve(false);
        }
      }, 100);
    });
  }

  /** Wait for a specific login stage; false on timeout or cancellation. */
  async function waitForStage(
    targetStage: LoginStage,
    token: number,
    timeoutMs = 5000,
  ): Promise<boolean> {
    return waitFor(() => getLoginStage() === targetStage, token, timeoutMs);
  }

  /** Poll for a selector; null on timeout or cancellation. */
  async function waitForSelector(
    selector: string,
    token: number,
    timeoutMs = 4000,
  ): Promise<HTMLElement | null> {
    return new Promise<HTMLElement | null>((resolve) => {
      const immediate = document.querySelector<HTMLElement>(selector);
      if (immediate !== null) {
        resolve(immediate);
        return;
      }
      let elapsed = 0;
      const timer = setInterval(() => {
        elapsed += 100;
        if (advanceStale(token) || elapsed >= timeoutMs) {
          clearInterval(timer);
          resolve(null);
          return;
        }
        const found = document.querySelector<HTMLElement>(selector);
        if (found !== null) {
          clearInterval(timer);
          resolve(found);
        }
      }, 100);
    });
  }

  async function runAdvance(
    target: LoginAdvanceTarget,
    token: number,
  ): Promise<void> {
    const current = getLoginStage() ?? "form";
    // eslint-disable-next-line security/detect-object-injection -- key is a typed LoginAdvanceTarget union member
    const targetRank = TARGET_RANK[target];

    // eslint-disable-next-line security/detect-object-injection -- key is a typed LoginStage union member
    if (STAGE_RANK[current] > targetRank) {
      // Rewind: the mounted login page holds its phase internally, so
      // the only honest rewind is a fresh mount, then playing forward.
      resetLoginFlow();
      // eslint-disable-next-line security/detect-object-injection -- key is a typed LoginStage union member
    } else if (STAGE_RANK[current] === targetRank && !isMethodTarget(target)) {
      // Method targets at equal rank may still need a method SWITCH;
      // everything else at its own rank is already there.
      if (target !== "done") return;
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
    return new Promise<HTMLElement | null>((resolve) => {
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
          for (const locale of locales) {
            // eslint-disable-next-line security/detect-object-injection -- key is a typed keyof typeof METHOD_LABELS
            const label = METHOD_LABELS[target]({ locale });
            if (
              control.matches(".k-list-item")
                ? text.includes(label)
                : text === label
            ) {
              return control;
            }
          }
        }
        return null;
      }

      const immediate = find();
      if (immediate !== null) {
        resolve(immediate);
        return;
      }
      let elapsed = 0;
      const timer = setInterval(() => {
        elapsed += 100;
        if (advanceStale(token) || elapsed >= timeoutMs) {
          clearInterval(timer);
          resolve(null);
          return;
        }
        const found = find();
        if (found !== null) {
          clearInterval(timer);
          resolve(found);
        }
      }, 100);
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
    if (router.feature !== feature || router.detail !== resolvedDetail) {
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
    if (el === null) return; // Element never appeared, skip silently

    // Close whatever a previous activation opened, unless the target
    // lives inside that overlay.
    dismissOpenOverlays(el);

    renderPulseMarker(el);

    if (tap) {
      const clickable = findClickableTarget(el);
      // Let the marker paint first so the response reads as its effect
      setTimeout(() => {
        clickable?.click();
      }, 150);
    }

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
    <DemoSplash dismissed={splashDismissed} />
  </QueryClientProvider>
</div>

<style>
  .phone-app {
    height: 100dvh;
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
