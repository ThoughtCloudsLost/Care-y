/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Update_CredentialsInputs */

const en_admin_telephony_update_credentials = /** @type {(inputs: Admin_Telephony_Update_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Update credentials`)
};

const es_admin_telephony_update_credentials = /** @type {(inputs: Admin_Telephony_Update_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actualizar credenciales`)
};

const en_xa2_admin_telephony_update_credentials = /** @type {(inputs: Admin_Telephony_Update_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùpdàtè crèdèntìàls ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Update credentials" |
*
* @param {Admin_Telephony_Update_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_update_credentials = /** @type {((inputs?: Admin_Telephony_Update_CredentialsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Update_CredentialsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_update_credentials(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_update_credentials(inputs)
	return en_admin_telephony_update_credentials(inputs)
});