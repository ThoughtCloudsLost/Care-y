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

const en_xa2_search_coverage_articles_all = /** @type {(inputs: Search_Coverage_Articles_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrchèd tìtlès ànd sùmmàrìès òf àll  ••••••••••••${i?.total} àrtìclès. •••⟧`)
};

/**
* | output |
* | --- |
* | "Searched titles and summaries of all {total} articles." |
*
* @param {Search_Coverage_Articles_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles_all = /** @type {((inputs: Search_Coverage_Articles_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_Articles_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_coverage_articles_all(inputs)
	if (locale === "en-XA") return en_xa2_search_coverage_articles_all(inputs)
	return en_search_coverage_articles_all(inputs)
});