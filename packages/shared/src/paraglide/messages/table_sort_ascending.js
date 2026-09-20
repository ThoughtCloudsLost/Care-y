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

const en_xa2_table_sort_ascending = /** @type {(inputs: Table_Sort_AscendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦àscèndìng •••⟧`)
};

/**
* | output |
* | --- |
* | "ascending" |
*
* @param {Table_Sort_AscendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const table_sort_ascending = /** @type {((inputs?: Table_Sort_AscendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Table_Sort_AscendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_table_sort_ascending(inputs)
	if (locale === "en-XA") return en_xa2_table_sort_ascending(inputs)
	return en_table_sort_ascending(inputs)
});