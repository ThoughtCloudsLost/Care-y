/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_No_ArticlesInputs */

const en_library_no_articles = /** @type {(inputs: Library_No_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No articles in this category`)
};

const es_library_no_articles = /** @type {(inputs: Library_No_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay artículos en esta categoría`)
};

/**
* | output |
* | --- |
* | "No articles in this category" |
*
* @param {Library_No_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_no_articles = /** @type {((inputs?: Library_No_ArticlesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_No_ArticlesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_no_articles(inputs)
	return es_library_no_articles(inputs)
});