/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Password_LabelInputs */

const en_admin_invite_password_label = /** @type {(inputs: Admin_Invite_Password_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Temporary Password`)
};

const es_admin_invite_password_label = /** @type {(inputs: Admin_Invite_Password_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasena Temporal`)
};

/**
* | output |
* | --- |
* | "Temporary Password" |
*
* @param {Admin_Invite_Password_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_label = /** @type {((inputs?: Admin_Invite_Password_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Password_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_password_label(inputs)
	return es_admin_invite_password_label(inputs)
});