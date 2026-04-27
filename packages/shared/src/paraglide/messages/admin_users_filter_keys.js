/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Filter_KeysInputs */

const en_admin_users_filter_keys = /** @type {(inputs: Admin_Users_Filter_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key Status`)
};

const es_admin_users_filter_keys = /** @type {(inputs: Admin_Users_Filter_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado de claves`)
};

/**
* | output |
* | --- |
* | "Key Status" |
*
* @param {Admin_Users_Filter_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_filter_keys = /** @type {((inputs?: Admin_Users_Filter_KeysInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Filter_KeysInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_filter_keys(inputs)
	return es_admin_users_filter_keys(inputs)
});