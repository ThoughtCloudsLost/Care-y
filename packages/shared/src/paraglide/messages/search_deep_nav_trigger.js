/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Deep_Nav_TriggerInputs */

const en_search_deep_nav_trigger = /** @type {(inputs: Search_Deep_Nav_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search encrypted`)
};

const es_search_deep_nav_trigger = /** @type {(inputs: Search_Deep_Nav_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar cifrados`)
};

/**
* | output |
* | --- |
* | "Search encrypted" |
*
* @param {Search_Deep_Nav_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_trigger = /** @type {((inputs?: Search_Deep_Nav_TriggerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Deep_Nav_TriggerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_deep_nav_trigger(inputs)
	return es_search_deep_nav_trigger(inputs)
});