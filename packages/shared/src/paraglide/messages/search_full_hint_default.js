/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Full_Hint_DefaultInputs */

const en_search_full_hint_default = /** @type {(inputs: Search_Full_Hint_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only showing results from loaded data. Tap to search everything you have access to.`)
};

const es_search_full_hint_default = /** @type {(inputs: Search_Full_Hint_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo se muestran resultados de datos cargados. Toca para buscar en todo lo que tienes acceso.`)
};

/**
* | output |
* | --- |
* | "Only showing results from loaded data. Tap to search everything you have access to." |
*
* @param {Search_Full_Hint_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_hint_default = /** @type {((inputs?: Search_Full_Hint_DefaultInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_Hint_DefaultInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_hint_default(inputs)
	return es_search_full_hint_default(inputs)
});