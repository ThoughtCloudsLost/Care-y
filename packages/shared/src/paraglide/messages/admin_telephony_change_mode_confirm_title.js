/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Change_Mode_Confirm_TitleInputs */

const en_admin_telephony_change_mode_confirm_title = /** @type {(inputs: Admin_Telephony_Change_Mode_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change telephony mode?`)
};

const es_admin_telephony_change_mode_confirm_title = /** @type {(inputs: Admin_Telephony_Change_Mode_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar modo de telefonia?`)
};

/**
* | output |
* | --- |
* | "Change telephony mode?" |
*
* @param {Admin_Telephony_Change_Mode_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_change_mode_confirm_title = /** @type {((inputs?: Admin_Telephony_Change_Mode_Confirm_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Change_Mode_Confirm_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_change_mode_confirm_title(inputs)
	return es_admin_telephony_change_mode_confirm_title(inputs)
});