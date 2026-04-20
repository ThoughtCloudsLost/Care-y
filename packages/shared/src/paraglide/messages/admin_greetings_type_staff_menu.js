/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_Staff_MenuInputs */

const en_admin_greetings_type_staff_menu = /** @type {(inputs: Admin_Greetings_Type_Staff_MenuInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Staff options`)
};

const es_admin_greetings_type_staff_menu = /** @type {(inputs: Admin_Greetings_Type_Staff_MenuInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opciones del personal`)
};

/**
* | output |
* | --- |
* | "Staff options" |
*
* @param {Admin_Greetings_Type_Staff_MenuInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_staff_menu = /** @type {((inputs?: Admin_Greetings_Type_Staff_MenuInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Staff_MenuInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_type_staff_menu(inputs)
	return es_admin_greetings_type_staff_menu(inputs)
});