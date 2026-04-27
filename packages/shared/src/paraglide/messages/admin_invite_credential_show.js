/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Credential_ShowInputs */

const en_admin_invite_credential_show = /** @type {(inputs: Admin_Invite_Credential_ShowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show`)
};

const es_admin_invite_credential_show = /** @type {(inputs: Admin_Invite_Credential_ShowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrar`)
};

/**
* | output |
* | --- |
* | "Show" |
*
* @param {Admin_Invite_Credential_ShowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_show = /** @type {((inputs?: Admin_Invite_Credential_ShowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_ShowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_credential_show(inputs)
	return es_admin_invite_credential_show(inputs)
});