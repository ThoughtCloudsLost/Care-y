/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Table_Col_CategoryInputs */

const en_library_table_col_category = /** @type {(inputs: Library_Table_Col_CategoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category`)
};

const es_library_table_col_category = /** @type {(inputs: Library_Table_Col_CategoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categoría`)
};

const en_xa2_library_table_col_category = /** @type {(inputs: Library_Table_Col_CategoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càtègòry •••⟧`)
};

/**
* | output |
* | --- |
* | "Category" |
*
* @param {Library_Table_Col_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_table_col_category = /** @type {((inputs?: Library_Table_Col_CategoryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Table_Col_CategoryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_table_col_category(inputs)
	if (locale === "en-XA") return en_xa2_library_table_col_category(inputs)
	return en_library_table_col_category(inputs)
});