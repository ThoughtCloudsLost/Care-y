/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Key_OkInputs */

const en_admin_users_key_ok = /** @type {(inputs: Admin_Users_Key_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Keys OK`)
};

const es_admin_users_key_ok = /** @type {(inputs: Admin_Users_Key_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Claves OK`)
};

/**
* | output |
* | --- |
* | "Keys OK" |
*
* @param {Admin_Users_Key_OkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_key_ok = /** @type {((inputs?: Admin_Users_Key_OkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Key_OkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_key_ok(inputs)
	return es_admin_users_key_ok(inputs)
});