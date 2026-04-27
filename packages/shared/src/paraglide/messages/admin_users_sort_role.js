/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Sort_RoleInputs */

const en_admin_users_sort_role = /** @type {(inputs: Admin_Users_Sort_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role`)
};

const es_admin_users_sort_role = /** @type {(inputs: Admin_Users_Sort_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol`)
};

/**
* | output |
* | --- |
* | "Role" |
*
* @param {Admin_Users_Sort_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_sort_role = /** @type {((inputs?: Admin_Users_Sort_RoleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Sort_RoleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_sort_role(inputs)
	return es_admin_users_sort_role(inputs)
});