/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Section_KbInputs */

const en_search_section_kb = /** @type {(inputs: Search_Section_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Articles`)
};

const es_search_section_kb = /** @type {(inputs: Search_Section_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Artículos`)
};

/**
* | output |
* | --- |
* | "Articles" |
*
* @param {Search_Section_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_kb = /** @type {((inputs?: Search_Section_KbInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_KbInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_section_kb(inputs)
	return es_search_section_kb(inputs)
});