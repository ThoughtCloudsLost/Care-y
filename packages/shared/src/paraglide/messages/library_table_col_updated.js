/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Table_Col_UpdatedInputs */

const en_library_table_col_updated = /** @type {(inputs: Library_Table_Col_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Updated`)
};

const es_library_table_col_updated = /** @type {(inputs: Library_Table_Col_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actualizado`)
};

const en_xa2_library_table_col_updated = /** @type {(inputs: Library_Table_Col_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùpdàtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Updated" |
*
* @param {Library_Table_Col_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_table_col_updated = /** @type {((inputs?: Library_Table_Col_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Table_Col_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_table_col_updated(inputs)
	if (locale === "en-XA") return en_xa2_library_table_col_updated(inputs)
	return en_library_table_col_updated(inputs)
});