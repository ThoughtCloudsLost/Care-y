/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, tickets: NonNullable<unknown> }} Search_Fetch_More_TicketsInputs */

const en_search_fetch_more_tickets = /** @type {(inputs: Search_Fetch_More_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Search the other ${i?.count} ${i?.tickets}`)
};

const es_search_fetch_more_tickets = /** @type {(inputs: Search_Fetch_More_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscar en los otros ${i?.count} ${i?.tickets}`)
};

const en_xa2_search_fetch_more_tickets = /** @type {(inputs: Search_Fetch_More_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch thè òthèr  ••••••${i?.count}  •${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Search the other {count} {tickets}" |
*
* @param {Search_Fetch_More_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_fetch_more_tickets = /** @type {((inputs: Search_Fetch_More_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Fetch_More_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_fetch_more_tickets(inputs)
	if (locale === "en-XA") return en_xa2_search_fetch_more_tickets(inputs)
	return en_search_fetch_more_tickets(inputs)
});