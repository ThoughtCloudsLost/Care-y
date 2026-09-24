/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_New_Replies_FirstInputs */

const en_tickets_sort_new_replies_first = /** @type {(inputs: Tickets_Sort_New_Replies_FirstInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New replies first`)
};

const es_tickets_sort_new_replies_first = /** @type {(inputs: Tickets_Sort_New_Replies_FirstInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas nuevas primero`)
};

const en_xa2_tickets_sort_new_replies_first = /** @type {(inputs: Tickets_Sort_New_Replies_FirstInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw rèplìès fìrst ••••••⟧`)
};

/**
* | output |
* | --- |
* | "New replies first" |
*
* @param {Tickets_Sort_New_Replies_FirstInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_new_replies_first = /** @type {((inputs?: Tickets_Sort_New_Replies_FirstInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_New_Replies_FirstInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_sort_new_replies_first(inputs)
	if (locale === "en-XA") return en_xa2_tickets_sort_new_replies_first(inputs)
	return en_tickets_sort_new_replies_first(inputs)
});