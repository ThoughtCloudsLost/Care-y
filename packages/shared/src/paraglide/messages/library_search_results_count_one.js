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

/**
* | output |
* | --- |
* | "{count} result" |
*
* @param {Library_Search_Results_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_search_results_count_one = /** @type {((inputs: Library_Search_Results_Count_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_Results_Count_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_search_results_count_one(inputs)
	return es_library_search_results_count_one(inputs)
});