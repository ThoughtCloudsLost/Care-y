/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Panel_TriggerInputs */

const en_search_panel_trigger = /** @type {(inputs: Search_Panel_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search everything not yet unlocked`)
};

const es_search_panel_trigger = /** @type {(inputs: Search_Panel_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar todo lo aún no desbloqueado`)
};

const en_xa2_search_panel_trigger = /** @type {(inputs: Search_Panel_TriggerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch èvèrythìng nòt yèt ùnlòckèd •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Search everything not yet unlocked" |
*
* @param {Search_Panel_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_panel_trigger = /** @type {((inputs?: Search_Panel_TriggerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Panel_TriggerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_panel_trigger(inputs)
	if (locale === "en-XA") return en_xa2_search_panel_trigger(inputs)
	return en_search_panel_trigger(inputs)
});