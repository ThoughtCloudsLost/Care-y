/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Table_Col_AuthorInputs */

const en_library_table_col_author = /** @type {(inputs: Library_Table_Col_AuthorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Author`)
};

const es_library_table_col_author = /** @type {(inputs: Library_Table_Col_AuthorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autor`)
};

/**
* | output |
* | --- |
* | "Author" |
*
* @param {Library_Table_Col_AuthorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_table_col_author = /** @type {((inputs?: Library_Table_Col_AuthorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Table_Col_AuthorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_table_col_author(inputs)
	return es_library_table_col_author(inputs)
});