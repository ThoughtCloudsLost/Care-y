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

const en_xa2_library_category_delete_blocked = /** @type {(inputs: Library_Category_Delete_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòvè òr dèlètè àll àrtìclès ìn thìs càtègòry fìrst •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Move or delete all articles in this category first" |
*
* @param {Library_Category_Delete_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_delete_blocked = /** @type {((inputs?: Library_Category_Delete_BlockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_Delete_BlockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_delete_blocked(inputs)
	if (locale === "en-XA") return en_xa2_library_category_delete_blocked(inputs)
	return en_library_category_delete_blocked(inputs)
});