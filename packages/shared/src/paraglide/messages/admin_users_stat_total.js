/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Stat_TotalInputs */

const en_admin_users_stat_total = /** @type {(inputs: Admin_Users_Stat_TotalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`total`)
};

const es_admin_users_stat_total = /** @type {(inputs: Admin_Users_Stat_TotalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`total`)
};

/**
* | output |
* | --- |
* | "total" |
*
* @param {Admin_Users_Stat_TotalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_stat_total = /** @type {((inputs?: Admin_Users_Stat_TotalInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Stat_TotalInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_stat_total(inputs)
	return es_admin_users_stat_total(inputs)
});