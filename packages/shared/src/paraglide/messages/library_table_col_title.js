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

/**
* | output |
* | --- |
* | "Title" |
*
* @param {Library_Table_Col_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_table_col_title = /** @type {((inputs?: Library_Table_Col_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Table_Col_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_table_col_title(inputs)
	return es_library_table_col_title(inputs)
});