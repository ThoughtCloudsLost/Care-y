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

const en_xa2_tickets_sort_newest = /** @type {(inputs: Tickets_Sort_NewestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèwèst fìrst ••••⟧`)
};

/**
* | output |
* | --- |
* | "Newest first" |
*
* @param {Tickets_Sort_NewestInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_newest = /** @type {((inputs?: Tickets_Sort_NewestInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_NewestInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_sort_newest(inputs)
	if (locale === "en-XA") return en_xa2_tickets_sort_newest(inputs)
	return en_tickets_sort_newest(inputs)
});