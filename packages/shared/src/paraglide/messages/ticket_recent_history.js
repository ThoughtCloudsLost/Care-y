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

/**
* | output |
* | --- |
* | "Recent {Tickets}" |
*
* @param {Ticket_Recent_HistoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_recent_history = /** @type {((inputs: Ticket_Recent_HistoryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Recent_HistoryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_recent_history(inputs)
	return es_ticket_recent_history(inputs)
});