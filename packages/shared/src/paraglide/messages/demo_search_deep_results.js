/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_Deep_ResultsInputs */

const en_demo_search_deep_results = /** @type {(inputs: Demo_Search_Deep_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Showing deep search results`)
};

const es_demo_search_deep_results = /** @type {(inputs: Demo_Search_Deep_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrando resultados de búsqueda profunda`)
};

/**
* | output |
* | --- |
* | "Showing deep search results" |
*
* @param {Demo_Search_Deep_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_deep_results = /** @type {((inputs?: Demo_Search_Deep_ResultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_Deep_ResultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_search_deep_results(inputs)
	return es_demo_search_deep_results(inputs)
});