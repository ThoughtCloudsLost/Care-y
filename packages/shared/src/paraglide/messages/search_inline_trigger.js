/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Inline_TriggerInputs */

const en_search_inline_trigger = /** @type {(inputs: Search_Inline_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search this page`)
};

const es_search_inline_trigger = /** @type {(inputs: Search_Inline_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar en esta pagina`)
};

/**
* | output |
* | --- |
* | "Search this page" |
*
* @param {Search_Inline_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_inline_trigger = /** @type {((inputs?: Search_Inline_TriggerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Inline_TriggerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_inline_trigger(inputs)
	return es_search_inline_trigger(inputs)
});