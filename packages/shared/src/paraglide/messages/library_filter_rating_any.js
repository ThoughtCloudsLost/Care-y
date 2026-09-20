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

const en_xa2_library_filter_rating_any = /** @type {(inputs: Library_Filter_Rating_AnyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àny ràtìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Any rating" |
*
* @param {Library_Filter_Rating_AnyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating_any = /** @type {((inputs?: Library_Filter_Rating_AnyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_Rating_AnyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_filter_rating_any(inputs)
	if (locale === "en-XA") return en_xa2_library_filter_rating_any(inputs)
	return en_library_filter_rating_any(inputs)
});