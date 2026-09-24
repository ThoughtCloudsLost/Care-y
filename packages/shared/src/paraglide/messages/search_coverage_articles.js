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

const en_xa2_search_coverage_articles = /** @type {(inputs: Search_Coverage_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrchèd tìtlès ànd sùmmàrìès òf  ••••••••••${i?.searched} òf  ••${i?.total} àrtìclès. •••⟧`)
};

/**
* | output |
* | --- |
* | "Searched titles and summaries of {searched} of {total} articles." |
*
* @param {Search_Coverage_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles = /** @type {((inputs: Search_Coverage_ArticlesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_ArticlesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_coverage_articles(inputs)
	if (locale === "en-XA") return en_xa2_search_coverage_articles(inputs)
	return en_search_coverage_articles(inputs)
});