/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Password_Too_ShortInputs */

const en_admin_invite_password_too_short = /** @type {(inputs: Admin_Invite_Password_Too_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password must be at least 16 characters`)
};

const es_admin_invite_password_too_short = /** @type {(inputs: Admin_Invite_Password_Too_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La contraseña debe tener al menos 16 caracteres`)
};

const en_xa2_admin_invite_password_too_short = /** @type {(inputs: Admin_Invite_Password_Too_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrd mùst bè àt lèàst 16 chàràctèrs ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Password must be at least 16 characters" |
*
* @param {Admin_Invite_Password_Too_ShortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_too_short = /** @type {((inputs?: Admin_Invite_Password_Too_ShortInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Password_Too_ShortInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_password_too_short(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_password_too_short(inputs)
	return en_admin_invite_password_too_short(inputs)
});