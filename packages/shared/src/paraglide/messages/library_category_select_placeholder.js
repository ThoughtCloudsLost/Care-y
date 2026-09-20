/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_Select_PlaceholderInputs */

const en_library_category_select_placeholder = /** @type {(inputs: Library_Category_Select_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select category`)
};

const es_library_category_select_placeholder = /** @type {(inputs: Library_Category_Select_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar categoría`)
};

const en_xa2_library_category_select_placeholder = /** @type {(inputs: Library_Category_Select_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct càtègòry •••••⟧`)
};

/**
* | output |
* | --- |
* | "Select category" |
*
* @param {Library_Category_Select_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_select_placeholder = /** @type {((inputs?: Library_Category_Select_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_Select_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_select_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_library_category_select_placeholder(inputs)
	return en_library_category_select_placeholder(inputs)
});