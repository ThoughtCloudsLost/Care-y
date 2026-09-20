/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Credential_IdentifierInputs */

const en_admin_invite_credential_identifier = /** @type {(inputs: Admin_Invite_Credential_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Username`)
};

const es_admin_invite_credential_identifier = /** @type {(inputs: Admin_Invite_Credential_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario de inicio de sesión`)
};

const en_xa2_admin_invite_credential_identifier = /** @type {(inputs: Admin_Invite_Credential_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lògìn Ùsèrnàmè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Admin_Invite_Credential_IdentifierInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_identifier = /** @type {((inputs?: Admin_Invite_Credential_IdentifierInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_IdentifierInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_credential_identifier(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_credential_identifier(inputs)
	return en_admin_invite_credential_identifier(inputs)
});