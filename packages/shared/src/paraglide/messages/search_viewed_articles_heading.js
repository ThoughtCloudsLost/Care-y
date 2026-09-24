/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Viewed_Articles_HeadingInputs */

const en_search_viewed_articles_heading = /** @type {(inputs: Search_Viewed_Articles_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Viewed articles`)
};

const es_search_viewed_articles_heading = /** @type {(inputs: Search_Viewed_Articles_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Artículos vistos`)
};

const en_xa2_search_viewed_articles_heading = /** @type {(inputs: Search_Viewed_Articles_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèwèd àrtìclès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Viewed articles" |
*
* @param {Search_Viewed_Articles_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_viewed_articles_heading = /** @type {((inputs?: Search_Viewed_Articles_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Viewed_Articles_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_viewed_articles_heading(inputs)
	if (locale === "en-XA") return en_xa2_search_viewed_articles_heading(inputs)
	return en_search_viewed_articles_heading(inputs)
});