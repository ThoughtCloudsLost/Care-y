/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Edit_Article_TitleInputs */

const en_library_edit_article_title = /** @type {(inputs: Library_Edit_Article_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Article`)
};

const es_library_edit_article_title = /** @type {(inputs: Library_Edit_Article_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar artículo`)
};

/**
* | output |
* | --- |
* | "Edit Article" |
*
* @param {Library_Edit_Article_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_edit_article_title = /** @type {((inputs?: Library_Edit_Article_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Edit_Article_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_edit_article_title(inputs)
	return es_library_edit_article_title(inputs)
});