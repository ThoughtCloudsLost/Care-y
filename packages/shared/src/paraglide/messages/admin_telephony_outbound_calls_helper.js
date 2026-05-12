/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ clients: NonNullable<unknown>, volunteer: NonNullable<unknown> }} Admin_Telephony_Outbound_Calls_HelperInputs */

const en_admin_telephony_outbound_calls_helper = /** @type {(inputs: Admin_Telephony_Outbound_Calls_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The number ${i?.clients} see when a ${i?.volunteer} calls them`)
};

const es_admin_telephony_outbound_calls_helper = /** @type {(inputs: Admin_Telephony_Outbound_Calls_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El numero que los ${i?.clients} ven cuando un ${i?.volunteer} les llama`)
};

/**
* | output |
* | --- |
* | "The number {clients} see when a {volunteer} calls them" |
*
* @param {Admin_Telephony_Outbound_Calls_HelperInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_outbound_calls_helper = /** @type {((inputs: Admin_Telephony_Outbound_Calls_HelperInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Outbound_Calls_HelperInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_outbound_calls_helper(inputs)
	return es_admin_telephony_outbound_calls_helper(inputs)
});