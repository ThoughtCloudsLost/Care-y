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

const en_xa2_library_new_article = /** @type {(inputs: Library_New_ArticleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw Àrtìclè ••••⟧`)
};

/**
* | output |
* | --- |
* | "New Article" |
*
* @param {Library_New_ArticleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_new_article = /** @type {((inputs?: Library_New_ArticleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_New_ArticleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_new_article(inputs)
	if (locale === "en-XA") return en_xa2_library_new_article(inputs)
	return en_library_new_article(inputs)
});