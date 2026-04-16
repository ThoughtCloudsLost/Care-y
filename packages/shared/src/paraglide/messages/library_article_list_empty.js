/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Article_List_EmptyInputs */

const en_library_article_list_empty = /** @type {(inputs: Library_Article_List_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Article list status`)
};

const es_library_article_list_empty = /** @type {(inputs: Library_Article_List_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado de la lista de artículos`)
};

/**
* | output |
* | --- |
* | "Article list status" |
*
* @param {Library_Article_List_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_list_empty = /** @type {((inputs?: Library_Article_List_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_List_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_article_list_empty(inputs)
	return es_library_article_list_empty(inputs)
});