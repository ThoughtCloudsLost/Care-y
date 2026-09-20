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

const en_xa2_table_sort_unsorted = /** @type {(inputs: Table_Sort_UnsortedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ùnsòrtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "unsorted" |
*
* @param {Table_Sort_UnsortedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const table_sort_unsorted = /** @type {((inputs?: Table_Sort_UnsortedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Table_Sort_UnsortedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_table_sort_unsorted(inputs)
	if (locale === "en-XA") return en_xa2_table_sort_unsorted(inputs)
	return en_table_sort_unsorted(inputs)
});