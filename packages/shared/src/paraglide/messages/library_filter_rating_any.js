/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Filter_Rating_AnyInputs */

const en_library_filter_rating_any = /** @type {(inputs: Library_Filter_Rating_AnyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Any rating`)
};

const es_library_filter_rating_any = /** @type {(inputs: Library_Filter_Rating_AnyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cualquier valoración`)
};

/**
* | output |
* | --- |
* | "Any rating" |
*
* @param {Library_Filter_Rating_AnyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating_any = /** @type {((inputs?: Library_Filter_Rating_AnyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_Rating_AnyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_filter_rating_any(inputs)
	return es_library_filter_rating_any(inputs)
});