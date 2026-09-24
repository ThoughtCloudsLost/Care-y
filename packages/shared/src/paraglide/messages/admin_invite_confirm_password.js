/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Confirm_PasswordInputs */

const en_admin_invite_confirm_password = /** @type {(inputs: Admin_Invite_Confirm_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm Password`)
};

const es_admin_invite_confirm_password = /** @type {(inputs: Admin_Invite_Confirm_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar contraseña`)
};

const en_xa2_admin_invite_confirm_password = /** @type {(inputs: Admin_Invite_Confirm_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìrm Pàsswòrd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Confirm Password" |
*
* @param {Admin_Invite_Confirm_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_confirm_password = /** @type {((inputs?: Admin_Invite_Confirm_PasswordInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Confirm_PasswordInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_confirm_password(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_confirm_password(inputs)
	return en_admin_invite_confirm_password(inputs)
});