/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteer: NonNullable<unknown> }} Admin_Invite_Password_HintInputs */

const en_admin_invite_password_hint = /** @type {(inputs: Admin_Invite_Password_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Share securely with the ${i?.volunteer}. They should change it after first login.`)
};

const es_admin_invite_password_hint = /** @type {(inputs: Admin_Invite_Password_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Comparta de forma segura con el ${i?.volunteer}. Debe cambiarla después del primer inicio de sesión.`)
};

const en_xa2_admin_invite_password_hint = /** @type {(inputs: Admin_Invite_Password_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Shàrè sècùrèly wìth thè  ••••••••${i?.volunteer}. Thèy shòùld chàngè ìt àftèr fìrst lògìn. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Share securely with the {volunteer}. They should change it after first login." |
*
* @param {Admin_Invite_Password_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_hint = /** @type {((inputs: Admin_Invite_Password_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Password_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_password_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_password_hint(inputs)
	return en_admin_invite_password_hint(inputs)
});