/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Edit_ArticleInputs */

const en_library_edit_article = /** @type {(inputs: Library_Edit_ArticleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit article`)
};

const es_library_edit_article = /** @type {(inputs: Library_Edit_ArticleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar artículo`)
};

/**
* | output |
* | --- |
* | "Edit article" |
*
* @param {Library_Edit_ArticleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_edit_article = /** @type {((inputs?: Library_Edit_ArticleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Edit_ArticleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_edit_article(inputs)
	return es_library_edit_article(inputs)
});