/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_More_CategoriesInputs */

const en_library_more_categories = /** @type {(inputs: Library_More_CategoriesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`& ${i?.count} more`)
};

const es_library_more_categories = /** @type {(inputs: Library_More_CategoriesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`y ${i?.count} más`)
};

const en_xa2_library_more_categories = /** @type {(inputs: Library_More_CategoriesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦&  •${i?.count} mòrè ••⟧`)
};

/**
* | output |
* | --- |
* | "& {count} more" |
*
* @param {Library_More_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_more_categories = /** @type {((inputs: Library_More_CategoriesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_More_CategoriesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_more_categories(inputs)
	if (locale === "en-XA") return en_xa2_library_more_categories(inputs)
	return en_library_more_categories(inputs)
});