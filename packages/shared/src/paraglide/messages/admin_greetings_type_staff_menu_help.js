/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_Staff_Menu_HelpInputs */

const en_admin_greetings_type_staff_menu_help = /** @type {(inputs: Admin_Greetings_Type_Staff_Menu_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Played when a volunteer accesses the phone menu.`)
};

const es_admin_greetings_type_staff_menu_help = /** @type {(inputs: Admin_Greetings_Type_Staff_Menu_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se reproduce cuando un voluntario accede al menu telefonico.`)
};

/**
* | output |
* | --- |
* | "Played when a volunteer accesses the phone menu." |
*
* @param {Admin_Greetings_Type_Staff_Menu_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_staff_menu_help = /** @type {((inputs?: Admin_Greetings_Type_Staff_Menu_HelpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Staff_Menu_HelpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_type_staff_menu_help(inputs)
	return es_admin_greetings_type_staff_menu_help(inputs)
});