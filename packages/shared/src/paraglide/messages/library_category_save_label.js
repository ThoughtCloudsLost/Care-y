/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_Save_LabelInputs */

const en_library_category_save_label = /** @type {(inputs: Library_Category_Save_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save category`)
};

const es_library_category_save_label = /** @type {(inputs: Library_Category_Save_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar categoría`)
};

/**
* | output |
* | --- |
* | "Save category" |
*
* @param {Library_Category_Save_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_save_label = /** @type {((inputs?: Library_Category_Save_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_Save_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_save_label(inputs)
	return es_library_category_save_label(inputs)
});