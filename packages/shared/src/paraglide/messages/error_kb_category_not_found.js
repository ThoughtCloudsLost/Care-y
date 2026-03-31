/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Kb_Category_Not_FoundInputs */

const en_error_kb_category_not_found = /** @type {(inputs: Error_Kb_Category_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category not found.`)
};

const es_error_kb_category_not_found = /** @type {(inputs: Error_Kb_Category_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categoría no encontrada.`)
};

/**
* | output |
* | --- |
* | "Category not found." |
*
* @param {Error_Kb_Category_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_kb_category_not_found = /** @type {((inputs?: Error_Kb_Category_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Kb_Category_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_kb_category_not_found(inputs)
	return es_error_kb_category_not_found(inputs)
});