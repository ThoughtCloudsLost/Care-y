/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_No_CategoriesInputs */

const en_library_no_categories = /** @type {(inputs: Library_No_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No categories yet`)
};

const es_library_no_categories = /** @type {(inputs: Library_No_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay categorías`)
};

/**
* | output |
* | --- |
* | "No categories yet" |
*
* @param {Library_No_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_no_categories = /** @type {((inputs?: Library_No_CategoriesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_No_CategoriesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_no_categories(inputs)
	return es_library_no_categories(inputs)
});