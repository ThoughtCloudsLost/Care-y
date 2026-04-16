/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Article_Body_PlaceholderInputs */

const en_library_article_body_placeholder = /** @type {(inputs: Library_Article_Body_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Start writing your article...`)
};

const es_library_article_body_placeholder = /** @type {(inputs: Library_Article_Body_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comienza a escribir tu artículo...`)
};

/**
* | output |
* | --- |
* | "Start writing your article..." |
*
* @param {Library_Article_Body_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_body_placeholder = /** @type {((inputs?: Library_Article_Body_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_Body_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_article_body_placeholder(inputs)
	return es_library_article_body_placeholder(inputs)
});