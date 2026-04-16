/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Article_InfoInputs */

const en_library_article_info = /** @type {(inputs: Library_Article_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Article information`)
};

const es_library_article_info = /** @type {(inputs: Library_Article_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Información del artículo`)
};

/**
* | output |
* | --- |
* | "Article information" |
*
* @param {Library_Article_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_info = /** @type {((inputs?: Library_Article_InfoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_InfoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_article_info(inputs)
	return es_library_article_info(inputs)
});