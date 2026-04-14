/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Filter_Rating_PositiveInputs */

const en_library_filter_rating_positive = /** @type {(inputs: Library_Filter_Rating_PositiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Positive`)
};

const es_library_filter_rating_positive = /** @type {(inputs: Library_Filter_Rating_PositiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Positiva`)
};

/**
* | output |
* | --- |
* | "Positive" |
*
* @param {Library_Filter_Rating_PositiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating_positive = /** @type {((inputs?: Library_Filter_Rating_PositiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_Rating_PositiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_filter_rating_positive(inputs)
	return es_library_filter_rating_positive(inputs)
});