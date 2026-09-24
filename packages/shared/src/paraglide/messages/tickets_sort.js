/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_SortInputs */

const en_tickets_sort = /** @type {(inputs: Tickets_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sort`)
};

const es_tickets_sort = /** @type {(inputs: Tickets_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ordenar`)
};

const en_xa2_tickets_sort = /** @type {(inputs: Tickets_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòrt ••⟧`)
};

/**
* | output |
* | --- |
* | "Sort" |
*
* @param {Tickets_SortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort = /** @type {((inputs?: Tickets_SortInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_SortInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_sort(inputs)
	if (locale === "en-XA") return en_xa2_tickets_sort(inputs)
	return en_tickets_sort(inputs)
});