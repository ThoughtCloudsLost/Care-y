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

/**
* | output |
* | --- |
* | "Sort" |
*
* @param {Library_SortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort = /** @type {((inputs?: Library_SortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_SortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_sort(inputs)
	return es_library_sort(inputs)
});