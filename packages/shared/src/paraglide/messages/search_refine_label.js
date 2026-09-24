/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Refine_LabelInputs */

const en_search_refine_label = /** @type {(inputs: Search_Refine_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refine search`)
};

const es_search_refine_label = /** @type {(inputs: Search_Refine_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refinar búsqueda`)
};

const en_xa2_search_refine_label = /** @type {(inputs: Search_Refine_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèfìnè sèàrch ••••⟧`)
};

/**
* | output |
* | --- |
* | "Refine search" |
*
* @param {Search_Refine_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_refine_label = /** @type {((inputs?: Search_Refine_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Refine_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_refine_label(inputs)
	if (locale === "en-XA") return en_xa2_search_refine_label(inputs)
	return en_search_refine_label(inputs)
});