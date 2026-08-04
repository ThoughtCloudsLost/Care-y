/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_RolesInputs */

const en_admin_tab_roles = /** @type {(inputs: Admin_Tab_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roles`)
};

const es_admin_tab_roles = /** @type {(inputs: Admin_Tab_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roles`)
};

/**
* | output |
* | --- |
* | "Roles" |
*
* @param {Admin_Tab_RolesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_roles = /** @type {((inputs?: Admin_Tab_RolesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_RolesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_roles(inputs)
	return es_admin_tab_roles(inputs)
});