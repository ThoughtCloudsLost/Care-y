/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Stat_ActiveInputs */

const en_admin_users_stat_active = /** @type {(inputs: Admin_Users_Stat_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`active`)
};

const es_admin_users_stat_active = /** @type {(inputs: Admin_Users_Stat_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`activos`)
};

/**
* | output |
* | --- |
* | "active" |
*
* @param {Admin_Users_Stat_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_stat_active = /** @type {((inputs?: Admin_Users_Stat_ActiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Stat_ActiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_stat_active(inputs)
	return es_admin_users_stat_active(inputs)
});