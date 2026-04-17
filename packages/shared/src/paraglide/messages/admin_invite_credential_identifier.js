/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Credential_IdentifierInputs */

const en_admin_invite_credential_identifier = /** @type {(inputs: Admin_Invite_Credential_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Identifier`)
};

const es_admin_invite_credential_identifier = /** @type {(inputs: Admin_Invite_Credential_IdentifierInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Identificador`)
};

/**
* | output |
* | --- |
* | "Identifier" |
*
* @param {Admin_Invite_Credential_IdentifierInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_identifier = /** @type {((inputs?: Admin_Invite_Credential_IdentifierInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Credential_IdentifierInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_credential_identifier(inputs)
	return es_admin_invite_credential_identifier(inputs)
});