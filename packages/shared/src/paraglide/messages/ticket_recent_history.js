/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown> }} Ticket_Recent_HistoryInputs */

const en_ticket_recent_history = /** @type {(inputs: Ticket_Recent_HistoryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Recent ${i?.Tickets}`)
};

const es_ticket_recent_history = /** @type {(inputs: Ticket_Recent_HistoryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets} recientes`)
};

const en_xa2_ticket_recent_history = /** @type {(inputs: Ticket_Recent_HistoryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rècènt  •••${i?.Tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Recent {Tickets}" |
*
* @param {Ticket_Recent_HistoryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_recent_history = /** @type {((inputs: Ticket_Recent_HistoryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Recent_HistoryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_recent_history(inputs)
	if (locale === "en-XA") return en_xa2_ticket_recent_history(inputs)
	return en_ticket_recent_history(inputs)
});