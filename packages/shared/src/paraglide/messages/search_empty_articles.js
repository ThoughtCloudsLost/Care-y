/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ query: NonNullable<unknown> }} Search_Empty_ArticlesInputs */

const en_search_empty_articles = /** @type {(inputs: Search_Empty_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No articles match "${i?.query}".`)
};

const es_search_empty_articles = /** @type {(inputs: Search_Empty_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No hay artículos que coincidan con "${i?.query}".`)
};

const en_xa2_search_empty_articles = /** @type {(inputs: Search_Empty_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò àrtìclès màtch " ••••••${i?.query}". •⟧`)
};

/**
* | output |
* | --- |
* | "No articles match \"{query}\"." |
*
* @param {Search_Empty_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_empty_articles = /** @type {((inputs: Search_Empty_ArticlesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Empty_ArticlesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_empty_articles(inputs)
	if (locale === "en-XA") return en_xa2_search_empty_articles(inputs)
	return en_search_empty_articles(inputs)
});