/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Change_Mode_Confirm_BodyInputs */

const en_admin_telephony_change_mode_confirm_body = /** @type {(inputs: Admin_Telephony_Change_Mode_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switching modes will reset your current telephony configuration. If you have BYOT credentials stored, they will be deleted.`)
};

const es_admin_telephony_change_mode_confirm_body = /** @type {(inputs: Admin_Telephony_Change_Mode_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar de modo restablecerá su configuración de telefonía actual. Si tiene credenciales BYOT almacenadas, se eliminaran.`)
};

const en_xa2_admin_telephony_change_mode_confirm_body = /** @type {(inputs: Admin_Telephony_Change_Mode_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Swìtchìng mòdès wìll rèsèt yòùr cùrrènt tèlèphòny cònfìgùràtìòn. Ìf yòù hàvè BYÒT crèdèntìàls stòrèd, thèy wìll bè dèlètèd. •••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Switching modes will reset your current telephony configuration. If you have BYOT credentials stored, they will be deleted." |
*
* @param {Admin_Telephony_Change_Mode_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_change_mode_confirm_body = /** @type {((inputs?: Admin_Telephony_Change_Mode_Confirm_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Change_Mode_Confirm_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_change_mode_confirm_body(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_change_mode_confirm_body(inputs)
	return en_admin_telephony_change_mode_confirm_body(inputs)
});