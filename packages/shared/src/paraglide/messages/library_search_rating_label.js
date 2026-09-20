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

const en_xa2_library_search_rating_label = /** @type {(inputs: Library_Search_Rating_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.percent}% hèlpfùl •••⟧`)
};

/**
* | output |
* | --- |
* | "{percent}% helpful" |
*
* @param {Library_Search_Rating_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_search_rating_label = /** @type {((inputs: Library_Search_Rating_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_Rating_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_search_rating_label(inputs)
	if (locale === "en-XA") return en_xa2_library_search_rating_label(inputs)
	return en_library_search_rating_label(inputs)
});