/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ KnowledgeBase: NonNullable<unknown> }} Search_Section_KbInputs */

const en_search_section_kb = /** @type {(inputs: Search_Section_KbInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.KnowledgeBase}`)
};

const es_search_section_kb = /** @type {(inputs: Search_Section_KbInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.KnowledgeBase}`)
};

const en_xa2_search_section_kb = /** @type {(inputs: Search_Section_KbInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.KnowledgeBase}⟧`)
};

/**
* | output |
* | --- |
* | "{KnowledgeBase}" |
*
* @param {Search_Section_KbInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_section_kb = /** @type {((inputs: Search_Section_KbInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_KbInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_section_kb(inputs)
	if (locale === "en-XA") return en_xa2_search_section_kb(inputs)
	return en_search_section_kb(inputs)
});