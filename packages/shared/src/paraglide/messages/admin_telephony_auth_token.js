/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Auth_TokenInputs */

const en_admin_telephony_auth_token = /** @type {(inputs: Admin_Telephony_Auth_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auth token`)
};

const es_admin_telephony_auth_token = /** @type {(inputs: Admin_Telephony_Auth_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Token de autenticación`)
};

const en_xa2_admin_telephony_auth_token = /** @type {(inputs: Admin_Telephony_Auth_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùth tòkèn •••⟧`)
};

/**
* | output |
* | --- |
* | "Auth token" |
*
* @param {Admin_Telephony_Auth_TokenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_auth_token = /** @type {((inputs?: Admin_Telephony_Auth_TokenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Auth_TokenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_auth_token(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_auth_token(inputs)
	return en_admin_telephony_auth_token(inputs)
});