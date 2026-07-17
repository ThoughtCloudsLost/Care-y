/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Table_Sort_AscendingInputs */

const en_table_sort_ascending = /** @type {(inputs: Table_Sort_AscendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ascending`)
};

const es_table_sort_ascending = /** @type {(inputs: Table_Sort_AscendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ascendente`)
};

/**
* | output |
* | --- |
* | "ascending" |
*
* @param {Table_Sort_AscendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const table_sort_ascending = /** @type {((inputs?: Table_Sort_AscendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Table_Sort_AscendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_table_sort_ascending(inputs)
	return es_table_sort_ascending(inputs)
});