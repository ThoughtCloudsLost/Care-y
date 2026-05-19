/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Mode_ChangedInputs */

const en_admin_telephony_mode_changed = /** @type {(inputs: Admin_Telephony_Mode_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony mode updated`)
};

const es_admin_telephony_mode_changed = /** @type {(inputs: Admin_Telephony_Mode_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Modo de telefonia actualizado`)
};

/**
* | output |
* | --- |
* | "Telephony mode updated" |
*
* @param {Admin_Telephony_Mode_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mode_changed = /** @type {((inputs?: Admin_Telephony_Mode_ChangedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Mode_ChangedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_mode_changed(inputs)
	return es_admin_telephony_mode_changed(inputs)
});