/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ section: NonNullable<unknown> }} Search_Show_All_LabelInputs */

const en_search_show_all_label = /** @type {(inputs: Search_Show_All_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Show all ${i?.section} results`)
};

const es_search_show_all_label = /** @type {(inputs: Search_Show_All_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ver todos los resultados de ${i?.section}`)
};

const en_xa2_search_show_all_label = /** @type {(inputs: Search_Show_All_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Shòw àll  •••${i?.section} rèsùlts •••⟧`)
};

/**
* | output |
* | --- |
* | "Show all {section} results" |
*
* @param {Search_Show_All_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_show_all_label = /** @type {((inputs: Search_Show_All_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Show_All_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_show_all_label(inputs)
	if (locale === "en-XA") return en_xa2_search_show_all_label(inputs)
	return en_search_show_all_label(inputs)
});