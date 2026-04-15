/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_AddInputs */

const en_library_category_add = /** @type {(inputs: Library_Category_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add Category`)
};

const es_library_category_add = /** @type {(inputs: Library_Category_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar categoría`)
};

/**
* | output |
* | --- |
* | "Add Category" |
*
* @param {Library_Category_AddInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_add = /** @type {((inputs?: Library_Category_AddInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_AddInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_add(inputs)
	return es_library_category_add(inputs)
});