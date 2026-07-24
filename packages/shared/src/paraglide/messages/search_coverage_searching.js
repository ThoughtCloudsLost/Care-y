/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Coverage_SearchingInputs */

const en_search_coverage_searching = /** @type {(inputs: Search_Coverage_SearchingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searching ${i?.searched} of ${i?.total}...`)
};

const es_search_coverage_searching = /** @type {(inputs: Search_Coverage_SearchingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscando ${i?.searched} de ${i?.total}...`)
};

/**
* | output |
* | --- |
* | "Searching {searched} of {total}..." |
*
* @param {Search_Coverage_SearchingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_searching = /** @type {((inputs: Search_Coverage_SearchingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_SearchingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_coverage_searching(inputs)
	return es_search_coverage_searching(inputs)
});