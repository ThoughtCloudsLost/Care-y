/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown> }} Nav_TicketsInputs */

const en_nav_tickets = /** @type {(inputs: Nav_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

const es_nav_tickets = /** @type {(inputs: Nav_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Nav_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_tickets = /** @type {((inputs: Nav_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_tickets(inputs)
	return es_nav_tickets(inputs)
});