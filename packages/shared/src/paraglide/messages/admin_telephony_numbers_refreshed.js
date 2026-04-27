/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Numbers_RefreshedInputs */

const en_admin_telephony_numbers_refreshed = /** @type {(inputs: Admin_Telephony_Numbers_RefreshedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone numbers refreshed`)
};

const es_admin_telephony_numbers_refreshed = /** @type {(inputs: Admin_Telephony_Numbers_RefreshedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numeros de telefono actualizados`)
};

/**
* | output |
* | --- |
* | "Phone numbers refreshed" |
*
* @param {Admin_Telephony_Numbers_RefreshedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_numbers_refreshed = /** @type {((inputs?: Admin_Telephony_Numbers_RefreshedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Numbers_RefreshedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_numbers_refreshed(inputs)
	return es_admin_telephony_numbers_refreshed(inputs)
});