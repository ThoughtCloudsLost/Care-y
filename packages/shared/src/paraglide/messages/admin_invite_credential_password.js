/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Credential_PasswordInputs */

const en_admin_invite_credential_password = /** @type {(inputs: Admin_Invite_Credential_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password`)
};

const es_admin_invite_credential_password = /** @type {(inputs: Admin_Invite_Credential_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasena`)
};

/**
* | output |
* | --- |
* | "Password" |
*
* @param {Admin_Invite_Credential_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_password = /** @type {((inputs?: Admin_Invite_Credential_PasswordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_PasswordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_credential_password(inputs)
	return es_admin_invite_credential_password(inputs)
});