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

/**
* | output |
* | --- |
* | "Hide" |
*
* @param {Admin_Invite_Credential_HideInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_hide = /** @type {((inputs?: Admin_Invite_Credential_HideInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_HideInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_credential_hide(inputs)
	return es_admin_invite_credential_hide(inputs)
});