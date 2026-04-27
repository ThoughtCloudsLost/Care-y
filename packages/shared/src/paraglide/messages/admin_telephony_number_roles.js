/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Number_RolesInputs */

const en_admin_telephony_number_roles = /** @type {(inputs: Admin_Telephony_Number_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Number roles`)
};

const es_admin_telephony_number_roles = /** @type {(inputs: Admin_Telephony_Number_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roles de numeros`)
};

/**
* | output |
* | --- |
* | "Number roles" |
*
* @param {Admin_Telephony_Number_RolesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_number_roles = /** @type {((inputs?: Admin_Telephony_Number_RolesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Number_RolesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_number_roles(inputs)
	return es_admin_telephony_number_roles(inputs)
});