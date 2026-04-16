/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_Sheet_TitleInputs */

const en_library_category_sheet_title = /** @type {(inputs: Library_Category_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage Categories`)
};

const es_library_category_sheet_title = /** @type {(inputs: Library_Category_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar categorías`)
};

/**
* | output |
* | --- |
* | "Manage Categories" |
*
* @param {Library_Category_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_sheet_title = /** @type {((inputs?: Library_Category_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_sheet_title(inputs)
	return es_library_category_sheet_title(inputs)
});