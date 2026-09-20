/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Article_PublishedInputs */

const en_library_article_published = /** @type {(inputs: Library_Article_PublishedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Article published`)
};

const es_library_article_published = /** @type {(inputs: Library_Article_PublishedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Artículo publicado`)
};

const en_xa2_library_article_published = /** @type {(inputs: Library_Article_PublishedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àrtìclè pùblìshèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Article published" |
*
* @param {Library_Article_PublishedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_article_published = /** @type {((inputs?: Library_Article_PublishedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_PublishedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_article_published(inputs)
	if (locale === "en-XA") return en_xa2_library_article_published(inputs)
	return en_library_article_published(inputs)
});