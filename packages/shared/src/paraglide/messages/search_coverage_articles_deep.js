/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ total: NonNullable<unknown> }} Search_Coverage_Articles_DeepInputs */

const en_search_coverage_articles_deep = /** @type {(inputs: Search_Coverage_Articles_DeepInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched all ${i?.total} articles and their full text.`)
};

const es_search_coverage_articles_deep = /** @type {(inputs: Search_Coverage_Articles_DeepInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se buscó en todos los ${i?.total} artículos y su texto completo.`)
};

/**
* | output |
* | --- |
* | "Searched all {total} articles and their full text." |
*
* @param {Search_Coverage_Articles_DeepInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles_deep = /** @type {((inputs: Search_Coverage_Articles_DeepInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_Articles_DeepInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_coverage_articles_deep(inputs)
	return es_search_coverage_articles_deep(inputs)
});