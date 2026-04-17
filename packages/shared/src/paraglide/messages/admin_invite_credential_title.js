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

/**
* | output |
* | --- |
* | "Account Created" |
*
* @param {Admin_Invite_Credential_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_title = /** @type {((inputs?: Admin_Invite_Credential_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_credential_title(inputs)
	return es_admin_invite_credential_title(inputs)
});