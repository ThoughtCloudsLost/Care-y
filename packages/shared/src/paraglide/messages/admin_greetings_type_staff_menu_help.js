/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteer: NonNullable<unknown> }} Admin_Greetings_Type_Staff_Menu_HelpInputs */

const en_admin_greetings_type_staff_menu_help = /** @type {(inputs: Admin_Greetings_Type_Staff_Menu_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Played when a ${i?.volunteer} accesses the phone menu.`)
};

const es_admin_greetings_type_staff_menu_help = /** @type {(inputs: Admin_Greetings_Type_Staff_Menu_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se reproduce cuando un ${i?.volunteer} accede al menu telefónico.`)
};

const en_xa2_admin_greetings_type_staff_menu_help = /** @type {(inputs: Admin_Greetings_Type_Staff_Menu_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Plàyèd whèn à  •••••${i?.volunteer} àccèssès thè phònè mènù. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Played when a {volunteer} accesses the phone menu." |
*
* @param {Admin_Greetings_Type_Staff_Menu_HelpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_staff_menu_help = /** @type {((inputs: Admin_Greetings_Type_Staff_Menu_HelpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Staff_Menu_HelpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_type_staff_menu_help(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_type_staff_menu_help(inputs)
	return en_admin_greetings_type_staff_menu_help(inputs)
});