/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Credential_DoneInputs */

const en_admin_invite_credential_done = /** @type {(inputs: Admin_Invite_Credential_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Another`)
};

const es_admin_invite_credential_done = /** @type {(inputs: Admin_Invite_Credential_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear otro`)
};

/**
* | output |
* | --- |
* | "Create Another" |
*
* @param {Admin_Invite_Credential_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_done = /** @type {((inputs?: Admin_Invite_Credential_DoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_DoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_credential_done(inputs)
	return es_admin_invite_credential_done(inputs)
});