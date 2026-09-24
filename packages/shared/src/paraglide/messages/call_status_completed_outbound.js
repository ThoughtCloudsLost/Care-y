/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ duration: NonNullable<unknown> }} Call_Status_Completed_OutboundInputs */

const en_call_status_completed_outbound = /** @type {(inputs: Call_Status_Completed_OutboundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Outbound call (${i?.duration})`)
};

const es_call_status_completed_outbound = /** @type {(inputs: Call_Status_Completed_OutboundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Llamada saliente (${i?.duration})`)
};

const en_xa2_call_status_completed_outbound = /** @type {(inputs: Call_Status_Completed_OutboundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Òùtbòùnd càll ( •••••${i?.duration}) •⟧`)
};

/**
* | output |
* | --- |
* | "Outbound call ({duration})" |
*
* @param {Call_Status_Completed_OutboundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const call_status_completed_outbound = /** @type {((inputs: Call_Status_Completed_OutboundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Status_Completed_OutboundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_call_status_completed_outbound(inputs)
	if (locale === "en-XA") return en_xa2_call_status_completed_outbound(inputs)
	return en_call_status_completed_outbound(inputs)
});