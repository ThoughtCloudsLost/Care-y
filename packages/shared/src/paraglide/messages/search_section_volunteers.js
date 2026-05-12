/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Volunteers: NonNullable<unknown> }} Search_Section_VolunteersInputs */

const en_search_section_volunteers = /** @type {(inputs: Search_Section_VolunteersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Volunteers}`)
};

const es_search_section_volunteers = /** @type {(inputs: Search_Section_VolunteersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Volunteers}`)
};

/**
* | output |
* | --- |
* | "{Volunteers}" |
*
* @param {Search_Section_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_volunteers = /** @type {((inputs: Search_Section_VolunteersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_VolunteersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_section_volunteers(inputs)
	return es_search_section_volunteers(inputs)
});