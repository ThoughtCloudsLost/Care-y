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

/**
* | output |
* | --- |
* | "& {count} more" |
*
* @param {Library_More_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_more_categories = /** @type {((inputs: Library_More_CategoriesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_More_CategoriesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_more_categories(inputs)
	return es_library_more_categories(inputs)
});