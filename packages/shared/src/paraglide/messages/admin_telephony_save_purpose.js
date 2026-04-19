/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Save_PurposeInputs */

const en_admin_telephony_save_purpose = /** @type {(inputs: Admin_Telephony_Save_PurposeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save roles`)
};

const es_admin_telephony_save_purpose = /** @type {(inputs: Admin_Telephony_Save_PurposeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar roles`)
};

/**
* | output |
* | --- |
* | "Save roles" |
*
* @param {Admin_Telephony_Save_PurposeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_save_purpose = /** @type {((inputs?: Admin_Telephony_Save_PurposeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Save_PurposeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_save_purpose(inputs)
	return es_admin_telephony_save_purpose(inputs)
});