/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Coverage_ArticlesInputs */

const en_search_coverage_articles = /** @type {(inputs: Search_Coverage_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched titles and summaries of ${i?.searched} of ${i?.total} articles.`)
};

const es_search_coverage_articles = /** @type {(inputs: Search_Coverage_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se buscó en títulos y resúmenes de ${i?.searched} de ${i?.total} artículos.`)
};

/**
* | output |
* | --- |
* | "Searched titles and summaries of {searched} of {total} articles." |
*
* @param {Search_Coverage_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles = /** @type {((inputs: Search_Coverage_ArticlesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_ArticlesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_coverage_articles(inputs)
	return es_search_coverage_articles(inputs)
});