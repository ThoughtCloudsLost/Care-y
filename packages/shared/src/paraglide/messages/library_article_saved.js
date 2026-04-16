/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Article_SavedInputs */

const en_library_article_saved = /** @type {(inputs: Library_Article_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Article saved`)
};

const es_library_article_saved = /** @type {(inputs: Library_Article_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Artículo guardado`)
};

/**
* | output |
* | --- |
* | "Article saved" |
*
* @param {Library_Article_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_saved = /** @type {((inputs?: Library_Article_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_article_saved(inputs)
	return es_library_article_saved(inputs)
});