/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Handbook_Search_No_ResultsInputs */

const en_demo_handbook_search_no_results = /** @type {(inputs: Demo_Handbook_Search_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No results found`)
};

const es_demo_handbook_search_no_results = /** @type {(inputs: Demo_Handbook_Search_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin resultados`)
};

/**
* | output |
* | --- |
* | "No results found" |
*
* @param {Demo_Handbook_Search_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_no_results = /** @type {((inputs?: Demo_Handbook_Search_No_ResultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Handbook_Search_No_ResultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_handbook_search_no_results(inputs)
	return en_demo_handbook_search_no_results(inputs)
});