/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_Delete_BlockedInputs */

const en_library_category_delete_blocked = /** @type {(inputs: Library_Category_Delete_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move or delete all articles in this category first`)
};

const es_library_category_delete_blocked = /** @type {(inputs: Library_Category_Delete_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Primero mueve o elimina todos los artículos de esta categoría`)
};

/**
* | output |
* | --- |
* | "Move or delete all articles in this category first" |
*
* @param {Library_Category_Delete_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_delete_blocked = /** @type {((inputs?: Library_Category_Delete_BlockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_Delete_BlockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_delete_blocked(inputs)
	return es_library_category_delete_blocked(inputs)
});