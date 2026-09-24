/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_SortInputs */

const en_library_sort = /** @type {(inputs: Library_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sort`)
};

const es_library_sort = /** @type {(inputs: Library_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ordenar`)
};

const en_xa2_library_sort = /** @type {(inputs: Library_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòrt ••⟧`)
};

/**
* | output |
* | --- |
* | "Sort" |
*
* @param {Library_SortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_sort = /** @type {((inputs?: Library_SortInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_SortInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_sort(inputs)
	if (locale === "en-XA") return en_xa2_library_sort(inputs)
	return en_library_sort(inputs)
});