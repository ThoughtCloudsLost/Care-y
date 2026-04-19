/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Credentials_SavedInputs */

const en_admin_telephony_credentials_saved = /** @type {(inputs: Admin_Telephony_Credentials_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Credentials saved`)
};

const es_admin_telephony_credentials_saved = /** @type {(inputs: Admin_Telephony_Credentials_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Credenciales guardadas`)
};

/**
* | output |
* | --- |
* | "Credentials saved" |
*
* @param {Admin_Telephony_Credentials_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_credentials_saved = /** @type {((inputs?: Admin_Telephony_Credentials_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Credentials_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_credentials_saved(inputs)
	return es_admin_telephony_credentials_saved(inputs)
});