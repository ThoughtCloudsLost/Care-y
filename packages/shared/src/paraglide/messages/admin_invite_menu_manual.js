/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Menu_ManualInputs */

const en_admin_invite_menu_manual = /** @type {(inputs: Admin_Invite_Menu_ManualInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create User Manually`)
};

const es_admin_invite_menu_manual = /** @type {(inputs: Admin_Invite_Menu_ManualInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear usuario manualmente`)
};

/**
* | output |
* | --- |
* | "Create User Manually" |
*
* @param {Admin_Invite_Menu_ManualInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_menu_manual = /** @type {((inputs?: Admin_Invite_Menu_ManualInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Menu_ManualInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_menu_manual(inputs)
	return es_admin_invite_menu_manual(inputs)
});