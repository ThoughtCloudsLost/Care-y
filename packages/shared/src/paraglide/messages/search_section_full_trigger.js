/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ section: NonNullable<unknown> }} Search_Section_Full_TriggerInputs */

const en_search_section_full_trigger = /** @type {(inputs: Search_Section_Full_TriggerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Search encrypted ${i?.section}`)
};

const es_search_section_full_trigger = /** @type {(inputs: Search_Section_Full_TriggerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscar cifrados ${i?.section}`)
};

/**
* | output |
* | --- |
* | "Search encrypted {section}" |
*
* @param {Search_Section_Full_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_full_trigger = /** @type {((inputs: Search_Section_Full_TriggerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_Full_TriggerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_section_full_trigger(inputs)
	return es_search_section_full_trigger(inputs)
});