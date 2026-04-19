/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Save_CredentialsInputs */

const en_admin_telephony_save_credentials = /** @type {(inputs: Admin_Telephony_Save_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save`)
};

const es_admin_telephony_save_credentials = /** @type {(inputs: Admin_Telephony_Save_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar`)
};

/**
* | output |
* | --- |
* | "Save" |
*
* @param {Admin_Telephony_Save_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_save_credentials = /** @type {((inputs?: Admin_Telephony_Save_CredentialsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Save_CredentialsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_save_credentials(inputs)
	return es_admin_telephony_save_credentials(inputs)
});