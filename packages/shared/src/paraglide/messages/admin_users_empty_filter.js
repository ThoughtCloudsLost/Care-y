/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Empty_FilterInputs */

const en_admin_users_empty_filter = /** @type {(inputs: Admin_Users_Empty_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No users match the current filters.`)
};

const es_admin_users_empty_filter = /** @type {(inputs: Admin_Users_Empty_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningun usuario coincide con los filtros actuales.`)
};

/**
* | output |
* | --- |
* | "No users match the current filters." |
*
* @param {Admin_Users_Empty_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_empty_filter = /** @type {((inputs?: Admin_Users_Empty_FilterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Empty_FilterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_empty_filter(inputs)
	return es_admin_users_empty_filter(inputs)
});