/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Password_LabelInputs */

const en_admin_invite_password_label = /** @type {(inputs: Admin_Invite_Password_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Temporary Password`)
};

const es_admin_invite_password_label = /** @type {(inputs: Admin_Invite_Password_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña Temporal`)
};

const en_xa2_admin_invite_password_label = /** @type {(inputs: Admin_Invite_Password_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèmpòràry Pàsswòrd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Temporary Password" |
*
* @param {Admin_Invite_Password_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_label = /** @type {((inputs?: Admin_Invite_Password_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Password_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_password_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_password_label(inputs)
	return en_admin_invite_password_label(inputs)
});