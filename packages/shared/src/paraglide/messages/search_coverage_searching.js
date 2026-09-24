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

const en_xa2_search_coverage_searching = /** @type {(inputs: Search_Coverage_SearchingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrchìng  •••${i?.searched} òf  ••${i?.total}... •⟧`)
};

/**
* | output |
* | --- |
* | "Searching {searched} of {total}..." |
*
* @param {Search_Coverage_SearchingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_coverage_searching = /** @type {((inputs: Search_Coverage_SearchingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_SearchingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_coverage_searching(inputs)
	if (locale === "en-XA") return en_xa2_search_coverage_searching(inputs)
	return en_search_coverage_searching(inputs)
});