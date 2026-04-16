/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_New_ArticleInputs */

const en_library_new_article = /** @type {(inputs: Library_New_ArticleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Article`)
};

const es_library_new_article = /** @type {(inputs: Library_New_ArticleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo artículo`)
};

/**
* | output |
* | --- |
* | "New Article" |
*
* @param {Library_New_ArticleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_new_article = /** @type {((inputs?: Library_New_ArticleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_New_ArticleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_new_article(inputs)
	return es_library_new_article(inputs)
});