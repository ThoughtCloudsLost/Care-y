/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Filter_Rating_HighInputs */

const en_library_filter_rating_high = /** @type {(inputs: Library_Filter_Rating_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Highly rated`)
};

const es_library_filter_rating_high = /** @type {(inputs: Library_Filter_Rating_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Muy valorado`)
};

const en_xa2_library_filter_rating_high = /** @type {(inputs: Library_Filter_Rating_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hìghly ràtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Highly rated" |
*
* @param {Library_Filter_Rating_HighInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating_high = /** @type {((inputs?: Library_Filter_Rating_HighInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_Rating_HighInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_filter_rating_high(inputs)
	if (locale === "en-XA") return en_xa2_library_filter_rating_high(inputs)
	return en_library_filter_rating_high(inputs)
});