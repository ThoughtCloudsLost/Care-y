/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Save_PurposeInputs */

const en_admin_telephony_save_purpose = /** @type {(inputs: Admin_Telephony_Save_PurposeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save changes`)
};

const es_admin_telephony_save_purpose = /** @type {(inputs: Admin_Telephony_Save_PurposeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar cambios`)
};

const en_xa2_admin_telephony_save_purpose = /** @type {(inputs: Admin_Telephony_Save_PurposeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè chàngès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_Telephony_Save_PurposeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_save_purpose = /** @type {((inputs?: Admin_Telephony_Save_PurposeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Save_PurposeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_save_purpose(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_save_purpose(inputs)
	return en_admin_telephony_save_purpose(inputs)
});