/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_UpdatedInputs */

const en_library_category_updated = /** @type {(inputs: Library_Category_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category updated`)
};

const es_library_category_updated = /** @type {(inputs: Library_Category_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categoría actualizada`)
};

/**
* | output |
* | --- |
* | "Category updated" |
*
* @param {Library_Category_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_updated = /** @type {((inputs?: Library_Category_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_updated(inputs)
	return es_library_category_updated(inputs)
});