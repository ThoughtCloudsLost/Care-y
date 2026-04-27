/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Password_HintInputs */

const en_admin_invite_password_hint = /** @type {(inputs: Admin_Invite_Password_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share securely with the volunteer. They should change it after first login.`)
};

const es_admin_invite_password_hint = /** @type {(inputs: Admin_Invite_Password_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comparta de forma segura con el voluntario. Debe cambiarla despues del primer inicio de sesion.`)
};

/**
* | output |
* | --- |
* | "Share securely with the volunteer. They should change it after first login." |
*
* @param {Admin_Invite_Password_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_hint = /** @type {((inputs?: Admin_Invite_Password_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Password_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_password_hint(inputs)
	return es_admin_invite_password_hint(inputs)
});