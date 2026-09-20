/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Credential_HideInputs */

const en_admin_invite_credential_hide = /** @type {(inputs: Admin_Invite_Credential_HideInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hide`)
};

const es_admin_invite_credential_hide = /** @type {(inputs: Admin_Invite_Credential_HideInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ocultar`)
};

const en_xa2_admin_invite_credential_hide = /** @type {(inputs: Admin_Invite_Credential_HideInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hìdè ••⟧`)
};

/**
* | output |
* | --- |
* | "Hide" |
*
* @param {Admin_Invite_Credential_HideInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_hide = /** @type {((inputs?: Admin_Invite_Credential_HideInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_HideInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_credential_hide(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_credential_hide(inputs)
	return en_admin_invite_credential_hide(inputs)
});