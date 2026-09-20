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

const en_xa2_demo_handbook_search_open = /** @type {(inputs: Demo_Handbook_Search_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch thè hàndbòòk ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Search the handbook" |
*
* @param {Demo_Handbook_Search_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_open = /** @type {((inputs?: Demo_Handbook_Search_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Handbook_Search_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_handbook_search_open(inputs)
	if (locale === "en-XA") return en_xa2_demo_handbook_search_open(inputs)
	return en_demo_handbook_search_open(inputs)
});