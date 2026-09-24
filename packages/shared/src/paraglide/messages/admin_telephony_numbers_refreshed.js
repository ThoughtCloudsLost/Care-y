/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Numbers_RefreshedInputs */

const en_admin_telephony_numbers_refreshed = /** @type {(inputs: Admin_Telephony_Numbers_RefreshedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone numbers refreshed`)
};

const es_admin_telephony_numbers_refreshed = /** @type {(inputs: Admin_Telephony_Numbers_RefreshedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Números de teléfono actualizados`)
};

const en_xa2_admin_telephony_numbers_refreshed = /** @type {(inputs: Admin_Telephony_Numbers_RefreshedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè nùmbèrs rèfrèshèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone numbers refreshed" |
*
* @param {Admin_Telephony_Numbers_RefreshedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_numbers_refreshed = /** @type {((inputs?: Admin_Telephony_Numbers_RefreshedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Numbers_RefreshedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_numbers_refreshed(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_numbers_refreshed(inputs)
	return en_admin_telephony_numbers_refreshed(inputs)
});