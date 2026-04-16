/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_Name_RequiredInputs */

const en_library_category_name_required = /** @type {(inputs: Library_Category_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category name is required`)
};

const es_library_category_name_required = /** @type {(inputs: Library_Category_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre de la categoría es obligatorio`)
};

/**
* | output |
* | --- |
* | "Category name is required" |
*
* @param {Library_Category_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_name_required = /** @type {((inputs?: Library_Category_Name_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_Name_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_name_required(inputs)
	return es_library_category_name_required(inputs)
});