/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Article_Title_PlaceholderInputs */

const en_library_article_title_placeholder = /** @type {(inputs: Library_Article_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Article title`)
};

const es_library_article_title_placeholder = /** @type {(inputs: Library_Article_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Título del artículo`)
};

/**
* | output |
* | --- |
* | "Article title" |
*
* @param {Library_Article_Title_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_title_placeholder = /** @type {((inputs?: Library_Article_Title_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_Title_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_article_title_placeholder(inputs)
	return es_library_article_title_placeholder(inputs)
});