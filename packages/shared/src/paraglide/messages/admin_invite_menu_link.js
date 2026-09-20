/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Menu_LinkInputs */

const en_admin_invite_menu_link = /** @type {(inputs: Admin_Invite_Menu_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite with Link`)
};

const es_admin_invite_menu_link = /** @type {(inputs: Admin_Invite_Menu_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitar con enlace`)
};

const en_xa2_admin_invite_menu_link = /** @type {(inputs: Admin_Invite_Menu_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè wìth Lìnk •••••⟧`)
};

/**
* | output |
* | --- |
* | "Invite with Link" |
*
* @param {Admin_Invite_Menu_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_menu_link = /** @type {((inputs?: Admin_Invite_Menu_LinkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Menu_LinkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_menu_link(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_menu_link(inputs)
	return en_admin_invite_menu_link(inputs)
});