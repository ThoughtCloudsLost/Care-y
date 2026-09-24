/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Demo_Handbook_Search_Result_CountInputs */

const en_demo_handbook_search_result_count = /** @type {(inputs: Demo_Handbook_Search_Result_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} results`)
};

const es_demo_handbook_search_result_count = /** @type {(inputs: Demo_Handbook_Search_Result_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} resultados`)
};

const en_xa2_demo_handbook_search_result_count = /** @type {(inputs: Demo_Handbook_Search_Result_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} rèsùlts •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} results" |
*
* @param {Demo_Handbook_Search_Result_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_result_count = /** @type {((inputs: Demo_Handbook_Search_Result_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Handbook_Search_Result_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_handbook_search_result_count(inputs)
	if (locale === "en-XA") return en_xa2_demo_handbook_search_result_count(inputs)
	return en_demo_handbook_search_result_count(inputs)
});