/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Ordered_List_SymbolInputs */

const en_library_editor_ordered_list_symbol = /** @type {(inputs: Library_Editor_Ordered_List_SymbolInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1.`)
};

const es_library_editor_ordered_list_symbol = /** @type {(inputs: Library_Editor_Ordered_List_SymbolInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1.`)
};

/**
* | output |
* | --- |
* | "1." |
*
* @param {Library_Editor_Ordered_List_SymbolInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_ordered_list_symbol = /** @type {((inputs?: Library_Editor_Ordered_List_SymbolInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Ordered_List_SymbolInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_ordered_list_symbol(inputs)
	return es_library_editor_ordered_list_symbol(inputs)
});