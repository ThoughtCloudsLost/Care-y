/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown> }} Search_Section_TicketsInputs */

const en_search_section_tickets = /** @type {(inputs: Search_Section_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

const es_search_section_tickets = /** @type {(inputs: Search_Section_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

const en_xa2_search_section_tickets = /** @type {(inputs: Search_Section_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Tickets}⟧`)
};

/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Search_Section_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_section_tickets = /** @type {((inputs: Search_Section_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_section_tickets(inputs)
	if (locale === "en-XA") return en_xa2_search_section_tickets(inputs)
	return en_search_section_tickets(inputs)
});