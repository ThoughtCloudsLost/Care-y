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

/**
* | output |
* | --- |
* | "Select category" |
*
* @param {Library_Category_Select_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_select_placeholder = /** @type {((inputs?: Library_Category_Select_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_Select_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_select_placeholder(inputs)
	return es_library_category_select_placeholder(inputs)
});