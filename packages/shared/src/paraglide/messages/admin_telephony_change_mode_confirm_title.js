/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Change_Mode_Confirm_TitleInputs */

const en_admin_telephony_change_mode_confirm_title = /** @type {(inputs: Admin_Telephony_Change_Mode_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change telephony mode?`)
};

const es_admin_telephony_change_mode_confirm_title = /** @type {(inputs: Admin_Telephony_Change_Mode_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Cambiar modo de telefonía?`)
};

const en_xa2_admin_telephony_change_mode_confirm_title = /** @type {(inputs: Admin_Telephony_Change_Mode_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngè tèlèphòny mòdè? •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Change telephony mode?" |
*
* @param {Admin_Telephony_Change_Mode_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_change_mode_confirm_title = /** @type {((inputs?: Admin_Telephony_Change_Mode_Confirm_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Change_Mode_Confirm_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_change_mode_confirm_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_change_mode_confirm_title(inputs)
	return en_admin_telephony_change_mode_confirm_title(inputs)
});