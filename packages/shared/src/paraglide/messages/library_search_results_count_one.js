/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Search_Results_Count_OneInputs */

const en_library_search_results_count_one = /** @type {(inputs: Library_Search_Results_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} result`)
};

const es_library_search_results_count_one = /** @type {(inputs: Library_Search_Results_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} resultado`)
};

const en_xa2_library_search_results_count_one = /** @type {(inputs: Library_Search_Results_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} rèsùlt •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} result" |
*
* @param {Library_Search_Results_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_search_results_count_one = /** @type {((inputs: Library_Search_Results_Count_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_Results_Count_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_search_results_count_one(inputs)
	if (locale === "en-XA") return en_xa2_library_search_results_count_one(inputs)
	return en_library_search_results_count_one(inputs)
});