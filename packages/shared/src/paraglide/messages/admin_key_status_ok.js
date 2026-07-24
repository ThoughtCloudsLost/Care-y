/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Key_Status_OkInputs */

const en_admin_key_status_ok = /** @type {(inputs: Admin_Key_Status_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ready`)
};

const es_admin_key_status_ok = /** @type {(inputs: Admin_Key_Status_OkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Listas`)
};

/**
* | output |
* | --- |
* | "Ready" |
*
* @param {Admin_Key_Status_OkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_key_status_ok = /** @type {((inputs?: Admin_Key_Status_OkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Key_Status_OkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_key_status_ok(inputs)
	return es_admin_key_status_ok(inputs)
});