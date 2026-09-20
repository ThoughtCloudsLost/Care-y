/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Empty_FilterInputs */

const en_admin_users_empty_filter = /** @type {(inputs: Admin_Users_Empty_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No users match the current filters.`)
};

const es_admin_users_empty_filter = /** @type {(inputs: Admin_Users_Empty_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningún usuario coincide con los filtros actuales.`)
};

const en_xa2_admin_users_empty_filter = /** @type {(inputs: Admin_Users_Empty_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò ùsèrs màtch thè cùrrènt fìltèrs. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No users match the current filters." |
*
* @param {Admin_Users_Empty_FilterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_empty_filter = /** @type {((inputs?: Admin_Users_Empty_FilterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Empty_FilterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_empty_filter(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_empty_filter(inputs)
	return en_admin_users_empty_filter(inputs)
});