/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Filter_RoleInputs */

const en_admin_users_filter_role = /** @type {(inputs: Admin_Users_Filter_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role`)
};

const es_admin_users_filter_role = /** @type {(inputs: Admin_Users_Filter_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol`)
};

const en_xa2_admin_users_filter_role = /** @type {(inputs: Admin_Users_Filter_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròlè ••⟧`)
};

/**
* | output |
* | --- |
* | "Role" |
*
* @param {Admin_Users_Filter_RoleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_filter_role = /** @type {((inputs?: Admin_Users_Filter_RoleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Filter_RoleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_filter_role(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_filter_role(inputs)
	return en_admin_users_filter_role(inputs)
});