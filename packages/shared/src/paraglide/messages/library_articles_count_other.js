/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Articles_Count_OtherInputs */

const en_library_articles_count_other = /** @type {(inputs: Library_Articles_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} articles`)
};

const es_library_articles_count_other = /** @type {(inputs: Library_Articles_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} artículos`)
};

const en_xa2_library_articles_count_other = /** @type {(inputs: Library_Articles_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} àrtìclès •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Articles_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_articles_count_other = /** @type {((inputs: Library_Articles_Count_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Articles_Count_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_articles_count_other(inputs)
	if (locale === "en-XA") return en_xa2_library_articles_count_other(inputs)
	return en_library_articles_count_other(inputs)
});