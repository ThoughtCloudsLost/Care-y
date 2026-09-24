/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Key_OkInputs */

const en_admin_users_key_ok = /** @type {(inputs: Admin_Users_Key_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ready`)
};

const es_admin_users_key_ok = /** @type {(inputs: Admin_Users_Key_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Listas`)
};

const en_xa2_admin_users_key_ok = /** @type {(inputs: Admin_Users_Key_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèàdy ••⟧`)
};

/**
* | output |
* | --- |
* | "Ready" |
*
* @param {Admin_Users_Key_OkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_key_ok = /** @type {((inputs?: Admin_Users_Key_OkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Key_OkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_key_ok(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_key_ok(inputs)
	return en_admin_users_key_ok(inputs)
});