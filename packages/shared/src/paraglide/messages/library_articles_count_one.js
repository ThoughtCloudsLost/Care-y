/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Articles_Count_OneInputs */

const en_library_articles_count_one = /** @type {(inputs: Library_Articles_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} article`)
};

const es_library_articles_count_one = /** @type {(inputs: Library_Articles_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} artículo`)
};

/**
* | output |
* | --- |
* | "{count} article" |
*
* @param {Library_Articles_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_articles_count_one = /** @type {((inputs: Library_Articles_Count_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Articles_Count_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_articles_count_one(inputs)
	return es_library_articles_count_one(inputs)
});