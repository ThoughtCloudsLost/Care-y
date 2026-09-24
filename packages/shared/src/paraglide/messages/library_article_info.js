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

const en_xa2_library_article_info = /** @type {(inputs: Library_Article_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àrtìclè ìnfòrmàtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Article information" |
*
* @param {Library_Article_InfoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_article_info = /** @type {((inputs?: Library_Article_InfoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_InfoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_article_info(inputs)
	if (locale === "en-XA") return en_xa2_library_article_info(inputs)
	return en_library_article_info(inputs)
});