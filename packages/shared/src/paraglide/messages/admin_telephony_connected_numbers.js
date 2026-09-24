/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Connected_NumbersInputs */

const en_admin_telephony_connected_numbers = /** @type {(inputs: Admin_Telephony_Connected_NumbersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Connected numbers`)
};

const es_admin_telephony_connected_numbers = /** @type {(inputs: Admin_Telephony_Connected_NumbersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Números conectados`)
};

const en_xa2_admin_telephony_connected_numbers = /** @type {(inputs: Admin_Telephony_Connected_NumbersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònnèctèd nùmbèrs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Connected numbers" |
*
* @param {Admin_Telephony_Connected_NumbersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_connected_numbers = /** @type {((inputs?: Admin_Telephony_Connected_NumbersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Connected_NumbersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_connected_numbers(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_connected_numbers(inputs)
	return en_admin_telephony_connected_numbers(inputs)
});