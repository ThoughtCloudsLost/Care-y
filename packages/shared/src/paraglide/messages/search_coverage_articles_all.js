/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ total: NonNullable<unknown> }} Search_Coverage_Articles_AllInputs */

const en_search_coverage_articles_all = /** @type {(inputs: Search_Coverage_Articles_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched titles and summaries of all ${i?.total} articles.`)
};

const es_search_coverage_articles_all = /** @type {(inputs: Search_Coverage_Articles_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se buscó en títulos y resúmenes de todos los ${i?.total} artículos.`)
};

/**
* | output |
* | --- |
* | "Searched titles and summaries of all {total} articles." |
*
* @param {Search_Coverage_Articles_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles_all = /** @type {((inputs: Search_Coverage_Articles_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_Articles_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_coverage_articles_all(inputs)
	return es_search_coverage_articles_all(inputs)
});