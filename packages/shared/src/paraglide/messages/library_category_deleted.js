/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_DeletedInputs */

const en_library_category_deleted = /** @type {(inputs: Library_Category_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category deleted`)
};

const es_library_category_deleted = /** @type {(inputs: Library_Category_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categoría eliminada`)
};

const en_xa2_library_category_deleted = /** @type {(inputs: Library_Category_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càtègòry dèlètèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Category deleted" |
*
* @param {Library_Category_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_deleted = /** @type {((inputs?: Library_Category_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_deleted(inputs)
	if (locale === "en-XA") return en_xa2_library_category_deleted(inputs)
	return en_library_category_deleted(inputs)
});