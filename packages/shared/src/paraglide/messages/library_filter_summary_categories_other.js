/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Filter_Summary_Categories_OtherInputs */

const en_library_filter_summary_categories_other = /** @type {(inputs: Library_Filter_Summary_Categories_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} categories`)
};

const es_library_filter_summary_categories_other = /** @type {(inputs: Library_Filter_Summary_Categories_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} categorías`)
};

const en_xa2_library_filter_summary_categories_other = /** @type {(inputs: Library_Filter_Summary_Categories_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} càtègòrìès ••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} categories" |
*
* @param {Library_Filter_Summary_Categories_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_summary_categories_other = /** @type {((inputs: Library_Filter_Summary_Categories_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_Summary_Categories_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_filter_summary_categories_other(inputs)
	if (locale === "en-XA") return en_xa2_library_filter_summary_categories_other(inputs)
	return en_library_filter_summary_categories_other(inputs)
});