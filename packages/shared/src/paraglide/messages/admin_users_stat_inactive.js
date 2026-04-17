/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Stat_InactiveInputs */

const en_admin_users_stat_inactive = /** @type {(inputs: Admin_Users_Stat_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`inactive`)
};

const es_admin_users_stat_inactive = /** @type {(inputs: Admin_Users_Stat_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`inactivos`)
};

/**
* | output |
* | --- |
* | "inactive" |
*
* @param {Admin_Users_Stat_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_stat_inactive = /** @type {((inputs?: Admin_Users_Stat_InactiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Stat_InactiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_stat_inactive(inputs)
	return es_admin_users_stat_inactive(inputs)
});