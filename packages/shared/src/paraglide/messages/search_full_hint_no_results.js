/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Full_Hint_No_ResultsInputs */

const en_search_full_hint_no_results = /** @type {(inputs: Search_Full_Hint_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You've searched loaded data only. Tap "Search all" to check everything you have access to.`)
};

const es_search_full_hint_no_results = /** @type {(inputs: Search_Full_Hint_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo se buscó en datos cargados. Toca "Buscar todo" para revisar todo lo que tienes acceso.`)
};

/**
* | output |
* | --- |
* | "You've searched loaded data only. Tap \"Search all\" to check everything you have access to." |
*
* @param {Search_Full_Hint_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_hint_no_results = /** @type {((inputs?: Search_Full_Hint_No_ResultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_Hint_No_ResultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_hint_no_results(inputs)
	return es_search_full_hint_no_results(inputs)
});