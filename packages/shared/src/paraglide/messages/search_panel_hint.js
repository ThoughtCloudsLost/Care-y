/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Panel_HintInputs */

const en_search_panel_hint = /** @type {(inputs: Search_Panel_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Results so far come from what this device has already unlocked.`)
};

const es_search_panel_hint = /** @type {(inputs: Search_Panel_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los resultados hasta ahora provienen de lo que este dispositivo ya desbloqueó.`)
};

const en_xa2_search_panel_hint = /** @type {(inputs: Search_Panel_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsùlts sò fàr còmè fròm whàt thìs dèvìcè hàs àlrèàdy ùnlòckèd. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Results so far come from what this device has already unlocked." |
*
* @param {Search_Panel_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_panel_hint = /** @type {((inputs?: Search_Panel_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Panel_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_panel_hint(inputs)
	if (locale === "en-XA") return en_xa2_search_panel_hint(inputs)
	return en_search_panel_hint(inputs)
});