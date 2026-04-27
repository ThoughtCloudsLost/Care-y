/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Refresh_NumbersInputs */

const en_admin_telephony_refresh_numbers = /** @type {(inputs: Admin_Telephony_Refresh_NumbersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refresh numbers`)
};

const es_admin_telephony_refresh_numbers = /** @type {(inputs: Admin_Telephony_Refresh_NumbersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actualizar numeros`)
};

/**
* | output |
* | --- |
* | "Refresh numbers" |
*
* @param {Admin_Telephony_Refresh_NumbersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_refresh_numbers = /** @type {((inputs?: Admin_Telephony_Refresh_NumbersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Refresh_NumbersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_refresh_numbers(inputs)
	return es_admin_telephony_refresh_numbers(inputs)
});