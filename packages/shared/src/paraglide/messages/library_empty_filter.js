/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Empty_FilterInputs */

const en_library_empty_filter = /** @type {(inputs: Library_Empty_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No articles match this filter`)
};

const es_library_empty_filter = /** @type {(inputs: Library_Empty_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningún artículo coincide con este filtro`)
};

/**
* | output |
* | --- |
* | "No articles match this filter" |
*
* @param {Library_Empty_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_empty_filter = /** @type {((inputs?: Library_Empty_FilterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Empty_FilterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_empty_filter(inputs)
	return es_library_empty_filter(inputs)
});