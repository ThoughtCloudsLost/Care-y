/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Sort_AlphaInputs */

const en_library_sort_alpha = /** @type {(inputs: Library_Sort_AlphaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A-Z`)
};

const es_library_sort_alpha = /** @type {(inputs: Library_Sort_AlphaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A-Z`)
};

/**
* | output |
* | --- |
* | "A-Z" |
*
* @param {Library_Sort_AlphaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort_alpha = /** @type {((inputs?: Library_Sort_AlphaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Sort_AlphaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_sort_alpha(inputs)
	return es_library_sort_alpha(inputs)
});