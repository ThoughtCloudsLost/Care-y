/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Key_Status_No_KeysInputs */

const en_admin_key_status_no_keys = /** @type {(inputs: Admin_Key_Status_No_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hasn't signed in yet`)
};

const es_admin_key_status_no_keys = /** @type {(inputs: Admin_Key_Status_No_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no ha iniciado sesión`)
};

const en_xa2_admin_key_status_no_keys = /** @type {(inputs: Admin_Key_Status_No_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hàsn't sìgnèd ìn yèt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Hasn't signed in yet" |
*
* @param {Admin_Key_Status_No_KeysInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_key_status_no_keys = /** @type {((inputs?: Admin_Key_Status_No_KeysInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Key_Status_No_KeysInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_key_status_no_keys(inputs)
	if (locale === "en-XA") return en_xa2_admin_key_status_no_keys(inputs)
	return en_admin_key_status_no_keys(inputs)
});