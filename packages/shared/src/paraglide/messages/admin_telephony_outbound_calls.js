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

const en_xa2_admin_telephony_outbound_calls = /** @type {(inputs: Admin_Telephony_Outbound_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òùtgòìng càlls •••••⟧`)
};

/**
* | output |
* | --- |
* | "Outgoing calls" |
*
* @param {Admin_Telephony_Outbound_CallsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_outbound_calls = /** @type {((inputs?: Admin_Telephony_Outbound_CallsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Outbound_CallsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_outbound_calls(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_outbound_calls(inputs)
	return en_admin_telephony_outbound_calls(inputs)
});