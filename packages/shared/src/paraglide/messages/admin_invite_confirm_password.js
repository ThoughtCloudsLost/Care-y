/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Confirm_PasswordInputs */

const en_admin_invite_confirm_password = /** @type {(inputs: Admin_Invite_Confirm_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm Password`)
};

const es_admin_invite_confirm_password = /** @type {(inputs: Admin_Invite_Confirm_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar contrasena`)
};

/**
* | output |
* | --- |
* | "Confirm Password" |
*
* @param {Admin_Invite_Confirm_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_confirm_password = /** @type {((inputs?: Admin_Invite_Confirm_PasswordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Confirm_PasswordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_confirm_password(inputs)
	return es_admin_invite_confirm_password(inputs)
});