/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Table_Col_TitleInputs */

const en_library_table_col_title = /** @type {(inputs: Library_Table_Col_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title`)
};

const es_library_table_col_title = /** @type {(inputs: Library_Table_Col_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Título`)
};

const en_xa2_library_table_col_title = /** @type {(inputs: Library_Table_Col_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìtlè ••⟧`)
};

/**
* | output |
* | --- |
* | "Title" |
*
* @param {Library_Table_Col_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_table_col_title = /** @type {((inputs?: Library_Table_Col_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Table_Col_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_table_col_title(inputs)
	if (locale === "en-XA") return en_xa2_library_table_col_title(inputs)
	return en_library_table_col_title(inputs)
});