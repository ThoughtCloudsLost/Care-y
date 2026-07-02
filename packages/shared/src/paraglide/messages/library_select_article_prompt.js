/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Select_Article_PromptInputs */

const en_library_select_article_prompt = /** @type {(inputs: Library_Select_Article_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select an article to read`)
};

const es_library_select_article_prompt = /** @type {(inputs: Library_Select_Article_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selecciona un artículo para leer`)
};

/**
* | output |
* | --- |
* | "Select an article to read" |
*
* @param {Library_Select_Article_PromptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_select_article_prompt = /** @type {((inputs?: Library_Select_Article_PromptInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Select_Article_PromptInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_select_article_prompt(inputs)
	return es_library_select_article_prompt(inputs)
});