/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_OldestInputs */

const en_tickets_sort_oldest = /** @type {(inputs: Tickets_Sort_OldestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Oldest first`)
};

const es_tickets_sort_oldest = /** @type {(inputs: Tickets_Sort_OldestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Más antiguos`)
};

const en_xa2_tickets_sort_oldest = /** @type {(inputs: Tickets_Sort_OldestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òldèst fìrst ••••⟧`)
};

/**
* | output |
* | --- |
* | "Oldest first" |
*
* @param {Tickets_Sort_OldestInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_oldest = /** @type {((inputs?: Tickets_Sort_OldestInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_OldestInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_sort_oldest(inputs)
	if (locale === "en-XA") return en_xa2_tickets_sort_oldest(inputs)
	return en_tickets_sort_oldest(inputs)
});