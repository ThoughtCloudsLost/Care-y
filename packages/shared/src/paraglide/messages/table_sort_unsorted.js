/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Table_Sort_UnsortedInputs */

const en_table_sort_unsorted = /** @type {(inputs: Table_Sort_UnsortedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`unsorted`)
};

const es_table_sort_unsorted = /** @type {(inputs: Table_Sort_UnsortedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`sin ordenar`)
};

/**
* | output |
* | --- |
* | "unsorted" |
*
* @param {Table_Sort_UnsortedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const table_sort_unsorted = /** @type {((inputs?: Table_Sort_UnsortedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Table_Sort_UnsortedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_table_sort_unsorted(inputs)
	return es_table_sort_unsorted(inputs)
});