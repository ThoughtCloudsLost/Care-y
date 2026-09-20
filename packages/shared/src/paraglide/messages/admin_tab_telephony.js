/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_TelephonyInputs */

const en_admin_tab_telephony = /** @type {(inputs: Admin_Tab_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_admin_tab_telephony = /** @type {(inputs: Admin_Tab_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonía`)
};

const en_xa2_admin_tab_telephony = /** @type {(inputs: Admin_Tab_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèlèphòny •••⟧`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Admin_Tab_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_telephony = /** @type {((inputs?: Admin_Tab_TelephonyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_TelephonyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_telephony(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_telephony(inputs)
	return en_admin_tab_telephony(inputs)
});