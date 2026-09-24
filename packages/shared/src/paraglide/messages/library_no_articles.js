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

const en_xa2_library_no_articles = /** @type {(inputs: Library_No_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò àrtìclès ìn thìs càtègòry •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No articles in this category" |
*
* @param {Library_No_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_no_articles = /** @type {((inputs?: Library_No_ArticlesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_No_ArticlesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_no_articles(inputs)
	if (locale === "en-XA") return en_xa2_library_no_articles(inputs)
	return en_library_no_articles(inputs)
});