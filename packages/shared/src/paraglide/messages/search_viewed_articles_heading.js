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

/**
* | output |
* | --- |
* | "Viewed articles" |
*
* @param {Search_Viewed_Articles_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_viewed_articles_heading = /** @type {((inputs?: Search_Viewed_Articles_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Viewed_Articles_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_viewed_articles_heading(inputs)
	return es_search_viewed_articles_heading(inputs)
});