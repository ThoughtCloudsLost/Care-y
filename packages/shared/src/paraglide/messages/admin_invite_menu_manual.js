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

const en_xa2_admin_invite_menu_manual = /** @type {(inputs: Admin_Invite_Menu_ManualInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè Ùsèr Mànùàlly ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Create User Manually" |
*
* @param {Admin_Invite_Menu_ManualInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_menu_manual = /** @type {((inputs?: Admin_Invite_Menu_ManualInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Menu_ManualInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_menu_manual(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_menu_manual(inputs)
	return en_admin_invite_menu_manual(inputs)
});