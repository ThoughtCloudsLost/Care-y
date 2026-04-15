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

/**
* | output |
* | --- |
* | "Delete Category" |
*
* @param {Library_Category_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_delete = /** @type {((inputs?: Library_Category_DeleteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_DeleteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_delete(inputs)
	return es_library_category_delete(inputs)
});