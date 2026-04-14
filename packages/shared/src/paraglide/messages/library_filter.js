/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_FilterInputs */

const en_library_filter = /** @type {(inputs: Library_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter articles`)
};

const es_library_filter = /** @type {(inputs: Library_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtrar artículos`)
};

/**
* | output |
* | --- |
* | "Filter articles" |
*
* @param {Library_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter = /** @type {((inputs?: Library_FilterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_FilterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_filter(inputs)
	return es_library_filter(inputs)
});