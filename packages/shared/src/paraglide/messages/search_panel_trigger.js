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

/**
* | output |
* | --- |
* | "Search everything not yet unlocked" |
*
* @param {Search_Panel_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_panel_trigger = /** @type {((inputs?: Search_Panel_TriggerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Panel_TriggerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_panel_trigger(inputs)
	return es_search_panel_trigger(inputs)
});