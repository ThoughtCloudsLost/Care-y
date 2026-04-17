/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_View_ListInputs */

const en_admin_users_view_list = /** @type {(inputs: Admin_Users_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`List view`)
};

const es_admin_users_view_list = /** @type {(inputs: Admin_Users_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista de lista`)
};

/**
* | output |
* | --- |
* | "List view" |
*
* @param {Admin_Users_View_ListInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_view_list = /** @type {((inputs?: Admin_Users_View_ListInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_View_ListInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_view_list(inputs)
	return es_admin_users_view_list(inputs)
});