/**
 * Canonical demo location store: the authoritative state for what
 * the demo is showing. Lives on the phone side (it dies and resets
 * with the iframe on restart) and is published through the bridge.
 *
 * Unidirectional flow with origin-tagged transitions:
 *
 *   page intent (scroll, click, deep link)
 *     -> setLocation() commits the location, then reconciles the phone
 *        to it via the injected ensureScreen driver
 *   phone interaction (tap, goto, login stage change)
 *     -> notePhoneChange()/reportTopic() recompute the location from
 *        the phone's state via bridgeStateToLocation
 *
 * Convergence invariant: at rest, sectionMatchesPhone(location.sectionId,
 * phone) always holds. Page intents pin the location while their
 * reconcile chain runs; when the chain ends (success, failure, or
 * cancellation by a real tap), the store re-checks the invariant and
 * snaps the location to the phone if the chain did not get there.
 * Nothing is ever dropped on a timing window; a mismatch can only be
 * transient while a chain is in flight.
 */

import {
  resolvePhoneCommand,
  bridgeStateToLocation,
  sectionMatchesPhone,
  loginTopicMatchesStage,
  getSubByTopic,
  type PhoneCommand,
} from "./scroll-sections.js";
import type {
  DemoFeature,
  DemoDetail,
  DemoLocation,
  DemoTopic,
  LocationOrigin,
  LoginStage,
  PageOrigin,
  SectionId,
} from "./bridge.js";

/** The phone screen state the store reconciles against. */
export interface PhoneScreenState {
  readonly feature: DemoFeature;
  readonly detail: DemoDetail;
  readonly searchOpen: boolean;
  readonly loginStage: LoginStage | null;
  /** The manifest route ID the phone currently shows; null during login. */
  readonly routeId: string | null;
}

export interface LocationStoreDeps {
  /** Read the phone's live screen state. */
  readonly getPhone: () => PhoneScreenState;
  /**
   * Drive the phone toward a command. Resolves when the attempt ends,
   * however it ends; the store runs its convergence check afterwards.
   * Implementations check isStale(token) at every async step.
   */
  readonly ensureScreen: (cmd: PhoneCommand, token: number) => Promise<void>;
  /**
   * Resolve the ticket ID the ticket-detail section navigates to.
   * Returns the real seeded ID when the engine is ready, or a
   * fallback sentinel before boot completes. A getter (rather than
   * a plain string) lets the store pick up the real ID once the
   * engine promise resolves without requiring re-construction.
   */
  readonly getTicketDetailId: () => string;
  /**
   * Resolve the article ID the library vote sub-section navigates
   * to. Same getter pattern as getTicketDetailId.
   */
  readonly getArticleDetailId: () => string;
}

export class DemoLocationStore {
  /** The canonical location both surfaces render. */
  location: DemoLocation = $state({ sectionId: "login", subSlug: null });
  /** Origin of the last location transition. */
  origin: LocationOrigin = $state("init");
  /** Bumps on every transition so re-selects are observable. */
  locationSeq: number = $state(0);
  /** Last classified interaction; cleared when its screen family is left. */
  topic: DemoTopic | null = $state(null);

  /** Cancellation token shared by all phone-driving chains. */
  private token = 0;
  /** Token of the page intent currently reconciling, null when settled. */
  private pendingToken: number | null = null;

  private readonly deps: LocationStoreDeps;

  constructor(deps: LocationStoreDeps) {
    this.deps = deps;
  }

  /** True when the given chain token has been superseded. */
  isStale(token: number): boolean {
    return token !== this.token;
  }

  /**
   * Cancel in-flight chains and unpin any pending intent. Called for
   * every trusted tap inside the phone: a real visitor interaction
   * always takes control from scripted driving.
   */
  cancelChains(): number {
    this.token += 1;
    this.pendingToken = null;
    return this.token;
  }

  /**
   * Page intent: move the shared location and reconcile the phone.
   * Always commits (a re-select of the current location re-drives the
   * phone and bumps locationSeq so the page can re-present it).
   */
  setLocation(
    sectionId: SectionId,
    subSlug: string | null,
    origin: PageOrigin,
  ): void {
    this.commit({ sectionId, subSlug }, origin);

    const token = this.cancelChains();
    this.pendingToken = token;
    const cmd = resolvePhoneCommand(
      sectionId,
      subSlug,
      this.deps.getTicketDetailId(),
      this.deps.getArticleDetailId(),
    );
    void this.deps.ensureScreen(cmd, token).finally(() => {
      // eslint-disable-next-line security/detect-possible-timing-attacks -- monotonic staleness counter, not a secret
      if (this.pendingToken !== token) return;
      this.pendingToken = null;
      // Convergence check: the chain was supposed to leave the phone
      // on this section's screen family. If it did not (element never
      // appeared, stage timed out), the phone wins and the location
      // snaps to what it actually shows.
      const phone = this.deps.getPhone();
      if (
        !sectionMatchesPhone(
          sectionId,
          phone.feature,
          phone.detail,
          phone.searchOpen,
          phone.routeId,
          subSlug,
        )
      ) {
        this.adoptPhone();
      }
    });
  }

  /**
   * Start a follow-mode chain (the login play-through): returns a
   * fresh token without pinning the location, so stage changes stream
   * into the narrative as the phone walks the flow.
   */
  beginFollowChain(): number {
    return this.cancelChains();
  }

  /**
   * A classified interaction inside the phone. Trusted and synthetic
   * clicks both report here; while a page intent is reconciling, the
   * adoption is deferred to the chain-end convergence check.
   */
  reportTopic(topic: DemoTopic): void {
    this.topic = topic;
    if (this.pendingToken !== null) return;
    this.adoptPhone();
  }

  /**
   * The phone's screen state changed (goto, tab tap, search toggle,
   * login stage transition). Recomputes the location from the phone.
   */
  notePhoneChange(): void {
    // Topic staleness is resolved at write time, atomically with the
    // screen change that invalidated it: a topic from a screen family
    // (or login stage) the phone has left never survives into the
    // next computation.
    if (this.topic !== null) {
      const home = getSubByTopic(this.topic);
      const phone = this.deps.getPhone();
      const sectionStale =
        home !== undefined &&
        !sectionMatchesPhone(
          home.sectionId,
          phone.feature,
          phone.detail,
          phone.searchOpen,
        );
      const stageStale =
        phone.feature === "login" &&
        !loginTopicMatchesStage(this.topic, phone.loginStage);
      if (sectionStale || stageStale) {
        this.topic = null;
      }
    }
    if (this.pendingToken !== null) return;
    this.adoptPhone();
  }

  /** Adopt whatever location the phone's current state maps to. */
  private adoptPhone(): void {
    const phone = this.deps.getPhone();
    const candidate = bridgeStateToLocation(
      phone.feature,
      phone.detail,
      phone.searchOpen,
      this.topic,
      phone.loginStage,
      phone.routeId,
    );
    if (
      candidate.sectionId === this.location.sectionId &&
      candidate.subSlug === this.location.subSlug
    ) {
      return;
    }
    // The very first sync (phone mount) is the boot baseline, not a
    // phone interaction: the page highlights it without moving.
    this.commit(candidate, this.locationSeq === 0 ? "init" : "phone");
  }

  private commit(location: DemoLocation, origin: LocationOrigin): void {
    this.location = location;
    this.origin = origin;
    this.locationSeq += 1;
  }
}

/** Create the location store. Call once per phone mount. */
export function createDemoLocationStore(
  deps: LocationStoreDeps,
): DemoLocationStore {
  return new DemoLocationStore(deps);
}
