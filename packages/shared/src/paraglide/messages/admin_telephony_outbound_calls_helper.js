/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ clients: NonNullable<unknown>, volunteer: NonNullable<unknown> }} Admin_Telephony_Outbound_Calls_HelperInputs */

const en_admin_telephony_outbound_calls_helper = /** @type {(inputs: Admin_Telephony_Outbound_Calls_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The number ${i?.clients} see when a ${i?.volunteer} calls them`)
};

const es_admin_telephony_outbound_calls_helper = /** @type {(inputs: Admin_Telephony_Outbound_Calls_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El número que los ${i?.clients} ven cuando un ${i?.volunteer} les llama`)
};

const en_xa2_admin_telephony_outbound_calls_helper = /** @type {(inputs: Admin_Telephony_Outbound_Calls_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thè nùmbèr  ••••${i?.clients} sèè whèn à  ••••${i?.volunteer} càlls thèm ••••⟧`)
};

/**
* | output |
* | --- |
* | "The number {clients} see when a {volunteer} calls them" |
*
* @param {Admin_Telephony_Outbound_Calls_HelperInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_outbound_calls_helper = /** @type {((inputs: Admin_Telephony_Outbound_Calls_HelperInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Outbound_Calls_HelperInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_outbound_calls_helper(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_outbound_calls_helper(inputs)
	return en_admin_telephony_outbound_calls_helper(inputs)
});