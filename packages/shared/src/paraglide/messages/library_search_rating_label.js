/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ percent: NonNullable<unknown> }} Library_Search_Rating_LabelInputs */

const en_library_search_rating_label = /** @type {(inputs: Library_Search_Rating_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.percent}% helpful`)
};

const es_library_search_rating_label = /** @type {(inputs: Library_Search_Rating_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.percent}% útil`)
};

/**
* | output |
* | --- |
* | "{percent}% helpful" |
*
* @param {Library_Search_Rating_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_search_rating_label = /** @type {((inputs: Library_Search_Rating_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_Rating_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_search_rating_label(inputs)
	return es_library_search_rating_label(inputs)
});