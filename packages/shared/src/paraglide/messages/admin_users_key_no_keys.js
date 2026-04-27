/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Key_No_KeysInputs */

const en_admin_users_key_no_keys = /** @type {(inputs: Admin_Users_Key_No_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No keys`)
};

const es_admin_users_key_no_keys = /** @type {(inputs: Admin_Users_Key_No_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin claves`)
};

/**
* | output |
* | --- |
* | "No keys" |
*
* @param {Admin_Users_Key_No_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_key_no_keys = /** @type {((inputs?: Admin_Users_Key_No_KeysInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Key_No_KeysInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_key_no_keys(inputs)
	return es_admin_users_key_no_keys(inputs)
});