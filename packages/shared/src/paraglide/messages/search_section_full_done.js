/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ total: NonNullable<unknown> }} Search_Section_Full_DoneInputs */

const en_search_section_full_done = /** @type {(inputs: Search_Section_Full_DoneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched ${i?.total} items`)
};

const es_search_section_full_done = /** @type {(inputs: Search_Section_Full_DoneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.total} elementos buscados`)
};

/**
* | output |
* | --- |
* | "Searched {total} items" |
*
* @param {Search_Section_Full_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_full_done = /** @type {((inputs: Search_Section_Full_DoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_Full_DoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_section_full_done(inputs)
	return es_search_section_full_done(inputs)
});