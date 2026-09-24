/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Filter_RatingInputs */

const en_library_filter_rating = /** @type {(inputs: Library_Filter_RatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rating`)
};

const es_library_filter_rating = /** @type {(inputs: Library_Filter_RatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Valoración`)
};

const en_xa2_library_filter_rating = /** @type {(inputs: Library_Filter_RatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ràtìng ••⟧`)
};

/**
* | output |
* | --- |
* | "Rating" |
*
* @param {Library_Filter_RatingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating = /** @type {((inputs?: Library_Filter_RatingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_RatingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_filter_rating(inputs)
	if (locale === "en-XA") return en_xa2_library_filter_rating(inputs)
	return en_library_filter_rating(inputs)
});