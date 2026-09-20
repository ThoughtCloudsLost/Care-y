/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_Result_CountInputs */

const en_search_result_count = /** @type {(inputs: Search_Result_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} results`)
};

const es_search_result_count = /** @type {(inputs: Search_Result_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} resultados`)
};

const en_xa2_search_result_count = /** @type {(inputs: Search_Result_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} rèsùlts •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} results" |
*
* @param {Search_Result_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_result_count = /** @type {((inputs: Search_Result_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Result_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_result_count(inputs)
	if (locale === "en-XA") return en_xa2_search_result_count(inputs)
	return en_search_result_count(inputs)
});