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

const en_xa2_library_empty_articles = /** @type {(inputs: Library_Empty_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng hèrè yèt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Nothing here yet" |
*
* @param {Library_Empty_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_empty_articles = /** @type {((inputs?: Library_Empty_ArticlesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Empty_ArticlesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_empty_articles(inputs)
	if (locale === "en-XA") return en_xa2_library_empty_articles(inputs)
	return en_library_empty_articles(inputs)
});