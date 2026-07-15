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

/**
* | output |
* | --- |
* | "Updated" |
*
* @param {Library_Table_Col_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_table_col_updated = /** @type {((inputs?: Library_Table_Col_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Table_Col_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_table_col_updated(inputs)
	return es_library_table_col_updated(inputs)
});