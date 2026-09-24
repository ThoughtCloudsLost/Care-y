/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Inline_TriggerInputs */

const en_search_inline_trigger = /** @type {(inputs: Search_Inline_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search this page`)
};

const es_search_inline_trigger = /** @type {(inputs: Search_Inline_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar en esta página`)
};

const en_xa2_search_inline_trigger = /** @type {(inputs: Search_Inline_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch thìs pàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Search this page" |
*
* @param {Search_Inline_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_inline_trigger = /** @type {((inputs?: Search_Inline_TriggerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Inline_TriggerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_inline_trigger(inputs)
	if (locale === "en-XA") return en_xa2_search_inline_trigger(inputs)
	return en_search_inline_trigger(inputs)
});