/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ query: NonNullable<unknown> }} Search_No_ResultsInputs */

const en_search_no_results = /** @type {(inputs: Search_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No results for "${i?.query}"`)
};

const es_search_no_results = /** @type {(inputs: Search_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sin resultados para "${i?.query}"`)
};

/**
* | output |
* | --- |
* | "No results for \"{query}\"" |
*
* @param {Search_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_no_results = /** @type {((inputs: Search_No_ResultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_No_ResultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_no_results(inputs)
	return es_search_no_results(inputs)
});