/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Add_ButtonInputs */

const en_admin_greetings_add_button = /** @type {(inputs: Admin_Greetings_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add greeting`)
};

const es_admin_greetings_add_button = /** @type {(inputs: Admin_Greetings_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar saludo`)
};

/**
* | output |
* | --- |
* | "Add greeting" |
*
* @param {Admin_Greetings_Add_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_add_button = /** @type {((inputs?: Admin_Greetings_Add_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Add_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_add_button(inputs)
	return es_admin_greetings_add_button(inputs)
});