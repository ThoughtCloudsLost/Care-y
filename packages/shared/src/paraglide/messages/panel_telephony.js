/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_TelephonyInputs */

const en_panel_telephony = /** @type {(inputs: Panel_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_panel_telephony = /** @type {(inputs: Panel_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonía`)
};

const en_xa2_panel_telephony = /** @type {(inputs: Panel_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèlèphòny •••⟧`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Panel_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_telephony = /** @type {((inputs?: Panel_TelephonyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_TelephonyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_telephony(inputs)
	if (locale === "en-XA") return en_xa2_panel_telephony(inputs)
	return en_panel_telephony(inputs)
});