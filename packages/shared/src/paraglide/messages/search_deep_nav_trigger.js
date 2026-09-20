/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Deep_Nav_TriggerInputs */

const en_search_deep_nav_trigger = /** @type {(inputs: Search_Deep_Nav_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search everything not yet unlocked`)
};

const es_search_deep_nav_trigger = /** @type {(inputs: Search_Deep_Nav_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar todo lo aún no desbloqueado`)
};

const en_xa2_search_deep_nav_trigger = /** @type {(inputs: Search_Deep_Nav_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch èvèrythìng nòt yèt ùnlòckèd •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Search everything not yet unlocked" |
*
* @param {Search_Deep_Nav_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_trigger = /** @type {((inputs?: Search_Deep_Nav_TriggerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Deep_Nav_TriggerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_deep_nav_trigger(inputs)
	if (locale === "en-XA") return en_xa2_search_deep_nav_trigger(inputs)
	return en_search_deep_nav_trigger(inputs)
});