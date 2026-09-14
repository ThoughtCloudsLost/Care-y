/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_NewestInputs */

const en_tickets_sort_newest = /** @type {(inputs: Tickets_Sort_NewestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Newest first`)
};

const es_tickets_sort_newest = /** @type {(inputs: Tickets_Sort_NewestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Más recientes`)
};

/**
* | output |
* | --- |
* | "Newest first" |
*
* @param {Tickets_Sort_NewestInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_newest = /** @type {((inputs?: Tickets_Sort_NewestInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_NewestInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_sort_newest(inputs)
	return en_tickets_sort_newest(inputs)
});