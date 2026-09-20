/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Ticket_Link_Case_Search_PlaceholderInputs */

const en_ticket_link_case_search_placeholder = /** @type {(inputs: Ticket_Link_Case_Search_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Search ${i?.tickets}...`)
};

const es_ticket_link_case_search_placeholder = /** @type {(inputs: Ticket_Link_Case_Search_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscar ${i?.tickets}...`)
};

/**
* | output |
* | --- |
* | "Search {tickets}..." |
*
* @param {Ticket_Link_Case_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_search_placeholder = /** @type {((inputs: Ticket_Link_Case_Search_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Link_Case_Search_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_link_case_search_placeholder(inputs)
	return en_ticket_link_case_search_placeholder(inputs)
});