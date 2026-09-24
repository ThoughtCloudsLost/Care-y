/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Fetch_More_ArticlesInputs */

const en_search_fetch_more_articles = /** @type {(inputs: Search_Fetch_More_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search inside full articles`)
};

const es_search_fetch_more_articles = /** @type {(inputs: Search_Fetch_More_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar dentro de los artículos completos`)
};

const en_xa2_search_fetch_more_articles = /** @type {(inputs: Search_Fetch_More_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch ìnsìdè fùll àrtìclès •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Search inside full articles" |
*
* @param {Search_Fetch_More_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_fetch_more_articles = /** @type {((inputs?: Search_Fetch_More_ArticlesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Fetch_More_ArticlesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_fetch_more_articles(inputs)
	if (locale === "en-XA") return en_xa2_search_fetch_more_articles(inputs)
	return en_search_fetch_more_articles(inputs)
});