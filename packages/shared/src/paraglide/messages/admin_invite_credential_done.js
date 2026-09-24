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

const en_xa2_admin_invite_credential_done = /** @type {(inputs: Admin_Invite_Credential_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè Ànòthèr •••••⟧`)
};

/**
* | output |
* | --- |
* | "Create Another" |
*
* @param {Admin_Invite_Credential_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_done = /** @type {((inputs?: Admin_Invite_Credential_DoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_DoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_credential_done(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_credential_done(inputs)
	return en_admin_invite_credential_done(inputs)
});