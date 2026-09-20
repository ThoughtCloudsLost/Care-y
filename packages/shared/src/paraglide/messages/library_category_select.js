/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_SelectInputs */

const en_library_category_select = /** @type {(inputs: Library_Category_SelectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category`)
};

const es_library_category_select = /** @type {(inputs: Library_Category_SelectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categoría`)
};

const en_xa2_library_category_select = /** @type {(inputs: Library_Category_SelectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càtègòry •••⟧`)
};

/**
* | output |
* | --- |
* | "Category" |
*
* @param {Library_Category_SelectInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_select = /** @type {((inputs?: Library_Category_SelectInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_SelectInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_select(inputs)
	if (locale === "en-XA") return en_xa2_library_category_select(inputs)
	return en_library_category_select(inputs)
});