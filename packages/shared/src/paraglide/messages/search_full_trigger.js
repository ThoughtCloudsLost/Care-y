/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Full_TriggerInputs */

const en_search_full_trigger = /** @type {(inputs: Search_Full_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search all`)
};

const es_search_full_trigger = /** @type {(inputs: Search_Full_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar todo`)
};

/**
* | output |
* | --- |
* | "Search all" |
*
* @param {Search_Full_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_trigger = /** @type {((inputs?: Search_Full_TriggerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_TriggerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_trigger(inputs)
	return es_search_full_trigger(inputs)
});