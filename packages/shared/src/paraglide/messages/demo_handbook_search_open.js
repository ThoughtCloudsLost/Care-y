/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Handbook_Search_OpenInputs */

const en_demo_handbook_search_open = /** @type {(inputs: Demo_Handbook_Search_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search the handbook`)
};

const es_demo_handbook_search_open = /** @type {(inputs: Demo_Handbook_Search_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar en el manual`)
};

/**
* | output |
* | --- |
* | "Search the handbook" |
*
* @param {Demo_Handbook_Search_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_open = /** @type {((inputs?: Demo_Handbook_Search_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Handbook_Search_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_handbook_search_open(inputs)
	return en_demo_handbook_search_open(inputs)
});