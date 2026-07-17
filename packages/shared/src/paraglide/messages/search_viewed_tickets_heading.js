/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, Tickets: NonNullable<unknown> }} Search_Viewed_Tickets_HeadingInputs */

const en_search_viewed_tickets_heading = /** @type {(inputs: Search_Viewed_Tickets_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Viewed ${i?.tickets}`)
};

const es_search_viewed_tickets_heading = /** @type {(inputs: Search_Viewed_Tickets_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets} vistos`)
};

/**
* | output |
* | --- |
* | "Viewed {tickets}" |
*
* @param {Search_Viewed_Tickets_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_viewed_tickets_heading = /** @type {((inputs: Search_Viewed_Tickets_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Viewed_Tickets_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_viewed_tickets_heading(inputs)
	return es_search_viewed_tickets_heading(inputs)
});