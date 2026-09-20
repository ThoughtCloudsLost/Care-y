/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_Results_TitleInputs */

const en_demo_search_results_title = /** @type {(inputs: Demo_Search_Results_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search results`)
};

const es_demo_search_results_title = /** @type {(inputs: Demo_Search_Results_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resultados de la búsqueda`)
};

const en_xa2_demo_search_results_title = /** @type {(inputs: Demo_Search_Results_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch rèsùlts •••••⟧`)
};

/**
* | output |
* | --- |
* | "Search results" |
*
* @param {Demo_Search_Results_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_search_results_title = /** @type {((inputs?: Demo_Search_Results_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_Results_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_search_results_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_search_results_title(inputs)
	return en_demo_search_results_title(inputs)
});