/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Save_CredentialsInputs */

const en_admin_telephony_save_credentials = /** @type {(inputs: Admin_Telephony_Save_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save changes`)
};

const es_admin_telephony_save_credentials = /** @type {(inputs: Admin_Telephony_Save_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar cambios`)
};

const en_xa2_admin_telephony_save_credentials = /** @type {(inputs: Admin_Telephony_Save_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè chàngès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_Telephony_Save_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_save_credentials = /** @type {((inputs?: Admin_Telephony_Save_CredentialsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Save_CredentialsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_save_credentials(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_save_credentials(inputs)
	return en_admin_telephony_save_credentials(inputs)
});