/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Section_Full_SearchingInputs */

const en_search_section_full_searching = /** @type {(inputs: Search_Section_Full_SearchingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Decrypting ${i?.searched}/${i?.total}...`)
};

const es_search_section_full_searching = /** @type {(inputs: Search_Section_Full_SearchingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Descifrando ${i?.searched}/${i?.total}...`)
};

/**
* | output |
* | --- |
* | "Decrypting {searched}/{total}..." |
*
* @param {Search_Section_Full_SearchingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_full_searching = /** @type {((inputs: Search_Section_Full_SearchingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_Full_SearchingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_section_full_searching(inputs)
	return es_search_section_full_searching(inputs)
});