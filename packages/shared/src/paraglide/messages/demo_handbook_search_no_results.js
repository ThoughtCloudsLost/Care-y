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

const en_xa2_demo_handbook_search_no_results = /** @type {(inputs: Demo_Handbook_Search_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò rèsùlts fòùnd •••••⟧`)
};

/**
* | output |
* | --- |
* | "No results found" |
*
* @param {Demo_Handbook_Search_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_no_results = /** @type {((inputs?: Demo_Handbook_Search_No_ResultsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Handbook_Search_No_ResultsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_handbook_search_no_results(inputs)
	if (locale === "en-XA") return en_xa2_demo_handbook_search_no_results(inputs)
	return en_demo_handbook_search_no_results(inputs)
});