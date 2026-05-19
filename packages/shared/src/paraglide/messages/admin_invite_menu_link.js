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

/**
* | output |
* | --- |
* | "Invite with Link" |
*
* @param {Admin_Invite_Menu_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_menu_link = /** @type {((inputs?: Admin_Invite_Menu_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Menu_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_menu_link(inputs)
	return es_admin_invite_menu_link(inputs)
});