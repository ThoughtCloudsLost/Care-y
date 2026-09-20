/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Credential_TitleInputs */

const en_admin_invite_credential_title = /** @type {(inputs: Admin_Invite_Credential_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account Created`)
};

const es_admin_invite_credential_title = /** @type {(inputs: Admin_Invite_Credential_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuenta Creada`)
};

const en_xa2_admin_invite_credential_title = /** @type {(inputs: Admin_Invite_Credential_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt Crèàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Account Created" |
*
* @param {Admin_Invite_Credential_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_title = /** @type {((inputs?: Admin_Invite_Credential_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_credential_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_credential_title(inputs)
	return en_admin_invite_credential_title(inputs)
});