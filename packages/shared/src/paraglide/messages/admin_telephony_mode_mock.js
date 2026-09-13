/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Mode_MockInputs */

const en_admin_telephony_mode_mock = /** @type {(inputs: Admin_Telephony_Mode_MockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simulated provider (development only)`)
};

const es_admin_telephony_mode_mock = /** @type {(inputs: Admin_Telephony_Mode_MockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proveedor simulado (solo desarrollo)`)
};

/**
* | output |
* | --- |
* | "Simulated provider (development only)" |
*
* @param {Admin_Telephony_Mode_MockInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mode_mock = /** @type {((inputs?: Admin_Telephony_Mode_MockInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Mode_MockInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_mode_mock(inputs)
	return es_admin_telephony_mode_mock(inputs)
});