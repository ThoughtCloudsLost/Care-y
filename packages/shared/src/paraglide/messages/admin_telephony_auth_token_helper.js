/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ provider: NonNullable<unknown> }} Admin_Telephony_Auth_Token_HelperInputs */

const en_admin_telephony_auth_token_helper = /** @type {(inputs: Admin_Telephony_Auth_Token_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Also in your ${i?.provider} account settings`)
};

const es_admin_telephony_auth_token_helper = /** @type {(inputs: Admin_Telephony_Auth_Token_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`También en la configuración de su cuenta de ${i?.provider}`)
};

const en_xa2_admin_telephony_auth_token_helper = /** @type {(inputs: Admin_Telephony_Auth_Token_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Àlsò ìn yòùr  ••••${i?.provider} àccòùnt sèttìngs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Also in your {provider} account settings" |
*
* @param {Admin_Telephony_Auth_Token_HelperInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_auth_token_helper = /** @type {((inputs: Admin_Telephony_Auth_Token_HelperInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Auth_Token_HelperInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_auth_token_helper(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_auth_token_helper(inputs)
	return en_admin_telephony_auth_token_helper(inputs)
});