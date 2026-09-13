/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Call_LogInputs */

const en_panel_call_log = /** @type {(inputs: Panel_Call_LogInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call Log`)
};

const es_panel_call_log = /** @type {(inputs: Panel_Call_LogInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registro de llamadas`)
};

/**
* | output |
* | --- |
* | "Call Log" |
*
* @param {Panel_Call_LogInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_call_log = /** @type {((inputs?: Panel_Call_LogInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Call_LogInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_call_log(inputs)
	return es_panel_call_log(inputs)
});