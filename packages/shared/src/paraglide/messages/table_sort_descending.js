/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Table_Sort_DescendingInputs */

const en_table_sort_descending = /** @type {(inputs: Table_Sort_DescendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`descending`)
};

const es_table_sort_descending = /** @type {(inputs: Table_Sort_DescendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`descendente`)
};

/**
* | output |
* | --- |
* | "descending" |
*
* @param {Table_Sort_DescendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const table_sort_descending = /** @type {((inputs?: Table_Sort_DescendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Table_Sort_DescendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_table_sort_descending(inputs)
	return es_table_sort_descending(inputs)
});