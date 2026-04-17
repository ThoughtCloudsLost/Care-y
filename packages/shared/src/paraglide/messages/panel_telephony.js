/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_TelephonyInputs */

const en_panel_telephony = /** @type {(inputs: Panel_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_panel_telephony = /** @type {(inputs: Panel_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonia`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Panel_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_telephony = /** @type {((inputs?: Panel_TelephonyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_TelephonyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_telephony(inputs)
	return es_panel_telephony(inputs)
});