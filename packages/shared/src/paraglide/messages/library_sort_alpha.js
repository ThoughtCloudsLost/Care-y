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

const en_xa2_library_sort_alpha = /** @type {(inputs: Library_Sort_AlphaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À-Z •⟧`)
};

/**
* | output |
* | --- |
* | "A-Z" |
*
* @param {Library_Sort_AlphaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_sort_alpha = /** @type {((inputs?: Library_Sort_AlphaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Sort_AlphaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_sort_alpha(inputs)
	if (locale === "en-XA") return en_xa2_library_sort_alpha(inputs)
	return en_library_sort_alpha(inputs)
});