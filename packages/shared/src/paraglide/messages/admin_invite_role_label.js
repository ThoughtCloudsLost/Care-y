/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Role_LabelInputs */

const en_admin_invite_role_label = /** @type {(inputs: Admin_Invite_Role_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role`)
};

const es_admin_invite_role_label = /** @type {(inputs: Admin_Invite_Role_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol`)
};

const en_xa2_admin_invite_role_label = /** @type {(inputs: Admin_Invite_Role_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròlè ••⟧`)
};

/**
* | output |
* | --- |
* | "Role" |
*
* @param {Admin_Invite_Role_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_role_label = /** @type {((inputs?: Admin_Invite_Role_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Role_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_role_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_role_label(inputs)
	return en_admin_invite_role_label(inputs)
});