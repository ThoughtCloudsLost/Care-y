/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_Results_DescInputs */

const en_demo_search_results_desc = /** @type {(inputs: Demo_Search_Results_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entries that match, shown as they read in the handbook.`)
};

const es_demo_search_results_desc = /** @type {(inputs: Demo_Search_Results_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las entradas que coinciden, mostradas tal como se leen en el manual.`)
};

const en_xa2_demo_search_results_desc = /** @type {(inputs: Demo_Search_Results_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntrìès thàt màtch, shòwn às thèy rèàd ìn thè hàndbòòk. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Entries that match, shown as they read in the handbook." |
*
* @param {Demo_Search_Results_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_search_results_desc = /** @type {((inputs?: Demo_Search_Results_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_Results_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_search_results_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_search_results_desc(inputs)
	return en_demo_search_results_desc(inputs)
});