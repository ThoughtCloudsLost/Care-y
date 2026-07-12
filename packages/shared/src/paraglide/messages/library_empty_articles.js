/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Empty_ArticlesInputs */

const en_library_empty_articles = /** @type {(inputs: Library_Empty_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing here yet`)
};

const es_library_empty_articles = /** @type {(inputs: Library_Empty_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay nada aquí`)
};

/**
* | output |
* | --- |
* | "Nothing here yet" |
*
* @param {Library_Empty_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_empty_articles = /** @type {((inputs?: Library_Empty_ArticlesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Empty_ArticlesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_empty_articles(inputs)
	return es_library_empty_articles(inputs)
});