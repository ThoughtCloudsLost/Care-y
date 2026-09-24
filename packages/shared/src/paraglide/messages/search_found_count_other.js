/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_Found_Count_OtherInputs */

const en_search_found_count_other = /** @type {(inputs: Search_Found_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} found`)
};

const es_search_found_count_other = /** @type {(inputs: Search_Found_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} encontrados`)
};

const en_xa2_search_found_count_other = /** @type {(inputs: Search_Found_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} fòùnd ••⟧`)
};

/**
* | output |
* | --- |
* | "{count} found" |
*
* @param {Search_Found_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_found_count_other = /** @type {((inputs: Search_Found_Count_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Found_Count_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_found_count_other(inputs)
	if (locale === "en-XA") return en_xa2_search_found_count_other(inputs)
	return en_search_found_count_other(inputs)
});