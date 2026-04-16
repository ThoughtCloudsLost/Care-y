/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ author: NonNullable<unknown> }} Library_Article_ByInputs */

const en_library_article_by = /** @type {(inputs: Library_Article_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`By ${i?.author}`)
};

const es_library_article_by = /** @type {(inputs: Library_Article_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Por ${i?.author}`)
};

/**
* | output |
* | --- |
* | "By {author}" |
*
* @param {Library_Article_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_by = /** @type {((inputs: Library_Article_ByInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Article_ByInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_article_by(inputs)
	return es_library_article_by(inputs)
});