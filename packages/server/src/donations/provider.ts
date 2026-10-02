/**
 * Donation (inflow) provider interface.
 *
 * Unlike telephony, an org may connect several donation providers at once,
 * so a provider instance belongs to one connection row rather than to the
 * org. The server relays fund totals on demand and stores none of them.
 */

/** One fund as the provider reports it, totals converted to cents. */
export interface ProviderFund {
  readonly externalId: string;
  readonly code: string | null;
  readonly name: string;
  readonly raisedMinor: number;
  readonly supporters: number;
}

/** A webhook registered at the provider. */
export interface RegisteredWebhook {
  readonly id: string;
  /** The shared secret the provider sends with each delivery, if it reports one. */
  readonly secret: string | null;
}

export interface InflowProvider {
  /** Every fund on the account, all pages. */
  listFunds(): Promise<readonly ProviderFund[]>;
  /** Register a webhook that fires when a donation succeeds. */
  registerWebhook(url: string): Promise<RegisteredWebhook>;
  deleteWebhook(id: string): Promise<void>;
}

/**
 * Builds a provider from a validated config object. The fetch argument
 * exists so tests can stand in for the network.
 */
export type InflowProviderConstructor = (
  config: unknown,
  fetchImpl?: typeof fetch,
) => InflowProvider;
