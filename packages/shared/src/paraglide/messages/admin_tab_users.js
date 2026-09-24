/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_UsersInputs */

const en_admin_tab_users = /** @type {(inputs: Admin_Tab_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Users`)
};

const es_admin_tab_users = /** @type {(inputs: Admin_Tab_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuarios`)
};

const en_xa2_admin_tab_users = /** @type {(inputs: Admin_Tab_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèrs ••⟧`)
};

/**
* | output |
* | --- |
* | "Users" |
*
* @param {Admin_Tab_UsersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_users = /** @type {((inputs?: Admin_Tab_UsersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_UsersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_users(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_users(inputs)
	return en_admin_tab_users(inputs)
});