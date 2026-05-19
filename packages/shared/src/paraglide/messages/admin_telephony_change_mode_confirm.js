/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Change_Mode_ConfirmInputs */

const en_admin_telephony_change_mode_confirm = /** @type {(inputs: Admin_Telephony_Change_Mode_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue`)
};

const es_admin_telephony_change_mode_confirm = /** @type {(inputs: Admin_Telephony_Change_Mode_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continuar`)
};

/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Admin_Telephony_Change_Mode_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_change_mode_confirm = /** @type {((inputs?: Admin_Telephony_Change_Mode_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Change_Mode_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_change_mode_confirm(inputs)
	return es_admin_telephony_change_mode_confirm(inputs)
});