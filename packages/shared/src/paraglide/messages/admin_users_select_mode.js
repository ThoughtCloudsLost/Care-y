/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Select_ModeInputs */

const en_admin_users_select_mode = /** @type {(inputs: Admin_Users_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select users`)
};

const es_admin_users_select_mode = /** @type {(inputs: Admin_Users_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar usuarios`)
};

/**
* | output |
* | --- |
* | "Select users" |
*
* @param {Admin_Users_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_select_mode = /** @type {((inputs?: Admin_Users_Select_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Select_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_select_mode(inputs)
	return es_admin_users_select_mode(inputs)
});