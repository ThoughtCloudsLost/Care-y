/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Password_MismatchInputs */

const en_admin_invite_password_mismatch = /** @type {(inputs: Admin_Invite_Password_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passwords do not match`)
};

const es_admin_invite_password_mismatch = /** @type {(inputs: Admin_Invite_Password_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las contrasenas no coinciden`)
};

/**
* | output |
* | --- |
* | "Passwords do not match" |
*
* @param {Admin_Invite_Password_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_mismatch = /** @type {((inputs?: Admin_Invite_Password_MismatchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Password_MismatchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_password_mismatch(inputs)
	return es_admin_invite_password_mismatch(inputs)
});