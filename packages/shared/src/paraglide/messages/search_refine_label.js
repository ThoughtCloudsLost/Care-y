/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Refine_LabelInputs */

const en_search_refine_label = /** @type {(inputs: Search_Refine_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refine search`)
};

const es_search_refine_label = /** @type {(inputs: Search_Refine_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refinar busqueda`)
};

/**
* | output |
* | --- |
* | "Refine search" |
*
* @param {Search_Refine_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_refine_label = /** @type {((inputs?: Search_Refine_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Refine_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_refine_label(inputs)
	return es_search_refine_label(inputs)
});