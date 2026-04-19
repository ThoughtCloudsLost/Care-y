/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Number_Roles_DescriptionInputs */

const en_admin_telephony_number_roles_description = /** @type {(inputs: Admin_Telephony_Number_Roles_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose which number to use for each type of communication.`)
};

const es_admin_telephony_number_roles_description = /** @type {(inputs: Admin_Telephony_Number_Roles_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elija que numero usar para cada tipo de comunicacion.`)
};

/**
* | output |
* | --- |
* | "Choose which number to use for each type of communication." |
*
* @param {Admin_Telephony_Number_Roles_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_number_roles_description = /** @type {((inputs?: Admin_Telephony_Number_Roles_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Number_Roles_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_number_roles_description(inputs)
	return es_admin_telephony_number_roles_description(inputs)
});