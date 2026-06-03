/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Change_ModeInputs */

const en_admin_telephony_change_mode = /** @type {(inputs: Admin_Telephony_Change_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change mode`)
};

const es_admin_telephony_change_mode = /** @type {(inputs: Admin_Telephony_Change_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar modo`)
};

/**
* | output |
* | --- |
* | "Change mode" |
*
* @param {Admin_Telephony_Change_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_change_mode = /** @type {((inputs?: Admin_Telephony_Change_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Change_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_change_mode(inputs)
	return es_admin_telephony_change_mode(inputs)
});