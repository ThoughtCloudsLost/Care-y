/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, query: NonNullable<unknown> }} Search_Empty_TicketsInputs */

const en_search_empty_tickets = /** @type {(inputs: Search_Empty_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No ${i?.tickets} match "${i?.query}".`)
};

const es_search_empty_tickets = /** @type {(inputs: Search_Empty_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No hay ${i?.tickets} que coincidan con "${i?.query}".`)
};

const en_xa2_search_empty_tickets = /** @type {(inputs: Search_Empty_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò  •${i?.tickets} màtch " •••${i?.query}". •⟧`)
};

/**
* | output |
* | --- |
* | "No {tickets} match \"{query}\"." |
*
* @param {Search_Empty_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_empty_tickets = /** @type {((inputs: Search_Empty_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Empty_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_empty_tickets(inputs)
	if (locale === "en-XA") return en_xa2_search_empty_tickets(inputs)
	return en_search_empty_tickets(inputs)
});