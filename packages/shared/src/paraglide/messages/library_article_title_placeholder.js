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

const en_xa2_library_article_title_placeholder = /** @type {(inputs: Library_Article_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àrtìclè tìtlè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Article title" |
*
* @param {Library_Article_Title_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_article_title_placeholder = /** @type {((inputs?: Library_Article_Title_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_Title_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_article_title_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_library_article_title_placeholder(inputs)
	return en_library_article_title_placeholder(inputs)
});