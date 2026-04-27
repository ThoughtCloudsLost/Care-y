/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Outbound_CallsInputs */

const en_admin_telephony_outbound_calls = /** @type {(inputs: Admin_Telephony_Outbound_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Outgoing calls`)
};

const es_admin_telephony_outbound_calls = /** @type {(inputs: Admin_Telephony_Outbound_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamadas salientes`)
};

/**
* | output |
* | --- |
* | "Outgoing calls" |
*
* @param {Admin_Telephony_Outbound_CallsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_outbound_calls = /** @type {((inputs?: Admin_Telephony_Outbound_CallsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Outbound_CallsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_outbound_calls(inputs)
	return es_admin_telephony_outbound_calls(inputs)
});