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

/**
* | output |
* | --- |
* | "Outbound call ({duration})" |
*
* @param {Call_Status_Completed_OutboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_completed_outbound = /** @type {((inputs: Call_Status_Completed_OutboundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Status_Completed_OutboundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_call_status_completed_outbound(inputs)
	return es_call_status_completed_outbound(inputs)
});