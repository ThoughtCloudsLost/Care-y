/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Table_Col_VotesInputs */

const en_library_table_col_votes = /** @type {(inputs: Library_Table_Col_VotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Votes`)
};

const es_library_table_col_votes = /** @type {(inputs: Library_Table_Col_VotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Votos`)
};

/**
* | output |
* | --- |
* | "Votes" |
*
* @param {Library_Table_Col_VotesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_table_col_votes = /** @type {((inputs?: Library_Table_Col_VotesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Table_Col_VotesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_table_col_votes(inputs)
	return es_library_table_col_votes(inputs)
});