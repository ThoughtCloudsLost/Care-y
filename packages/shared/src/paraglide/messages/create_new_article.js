/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Create_New_ArticleInputs */

const en_create_new_article = /** @type {(inputs: Create_New_ArticleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Article`)
};

const es_create_new_article = /** @type {(inputs: Create_New_ArticleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo Artículo`)
};

/**
* | output |
* | --- |
* | "New Article" |
*
* @param {Create_New_ArticleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_article = /** @type {((inputs?: Create_New_ArticleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_New_ArticleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_create_new_article(inputs)
	return es_create_new_article(inputs)
});