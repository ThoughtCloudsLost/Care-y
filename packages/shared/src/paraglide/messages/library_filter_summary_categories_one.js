/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Filter_Summary_Categories_OneInputs */

const en_library_filter_summary_categories_one = /** @type {(inputs: Library_Filter_Summary_Categories_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} category`)
};

const es_library_filter_summary_categories_one = /** @type {(inputs: Library_Filter_Summary_Categories_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} categoría`)
};

const en_xa2_library_filter_summary_categories_one = /** @type {(inputs: Library_Filter_Summary_Categories_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} càtègòry •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} category" |
*
* @param {Library_Filter_Summary_Categories_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_summary_categories_one = /** @type {((inputs: Library_Filter_Summary_Categories_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_Summary_Categories_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_filter_summary_categories_one(inputs)
	if (locale === "en-XA") return en_xa2_library_filter_summary_categories_one(inputs)
	return en_library_filter_summary_categories_one(inputs)
});