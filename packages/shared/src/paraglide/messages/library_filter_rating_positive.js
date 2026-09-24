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

const en_xa2_library_filter_rating_positive = /** @type {(inputs: Library_Filter_Rating_PositiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pòsìtìvè •••⟧`)
};

/**
* | output |
* | --- |
* | "Positive" |
*
* @param {Library_Filter_Rating_PositiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating_positive = /** @type {((inputs?: Library_Filter_Rating_PositiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_Rating_PositiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_filter_rating_positive(inputs)
	if (locale === "en-XA") return en_xa2_library_filter_rating_positive(inputs)
	return en_library_filter_rating_positive(inputs)
});