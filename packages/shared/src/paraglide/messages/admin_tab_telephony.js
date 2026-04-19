/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_TelephonyInputs */

const en_admin_tab_telephony = /** @type {(inputs: Admin_Tab_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_admin_tab_telephony = /** @type {(inputs: Admin_Tab_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonia`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Admin_Tab_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_telephony = /** @type {((inputs?: Admin_Tab_TelephonyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_TelephonyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_telephony(inputs)
	return es_admin_tab_telephony(inputs)
});