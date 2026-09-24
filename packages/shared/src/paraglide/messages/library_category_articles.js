/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Category_ArticlesInputs */

const en_library_category_articles = /** @type {(inputs: Library_Category_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} articles`)
};

const es_library_category_articles = /** @type {(inputs: Library_Category_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} artículos`)
};

const en_xa2_library_category_articles = /** @type {(inputs: Library_Category_ArticlesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} àrtìclès •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Category_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_articles = /** @type {((inputs: Library_Category_ArticlesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_ArticlesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_articles(inputs)
	if (locale === "en-XA") return en_xa2_library_category_articles(inputs)
	return en_library_category_articles(inputs)
});