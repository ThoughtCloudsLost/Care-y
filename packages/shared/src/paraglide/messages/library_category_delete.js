/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_DeleteInputs */

const en_library_category_delete = /** @type {(inputs: Library_Category_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete Category`)
};

const es_library_category_delete = /** @type {(inputs: Library_Category_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar categoría`)
};

const en_xa2_library_category_delete = /** @type {(inputs: Library_Category_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè Càtègòry •••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete Category" |
*
* @param {Library_Category_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_delete = /** @type {((inputs?: Library_Category_DeleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_DeleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_delete(inputs)
	if (locale === "en-XA") return en_xa2_library_category_delete(inputs)
	return en_library_category_delete(inputs)
});