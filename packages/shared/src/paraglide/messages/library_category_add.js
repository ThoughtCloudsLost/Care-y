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

const en_xa2_library_category_add = /** @type {(inputs: Library_Category_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd Càtègòry ••••⟧`)
};

/**
* | output |
* | --- |
* | "Add Category" |
*
* @param {Library_Category_AddInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_add = /** @type {((inputs?: Library_Category_AddInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_AddInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_add(inputs)
	if (locale === "en-XA") return en_xa2_library_category_add(inputs)
	return en_library_category_add(inputs)
});