/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ duration: NonNullable<unknown> }} Call_Status_Completed_InboundInputs */

const en_call_status_completed_inbound = /** @type {(inputs: Call_Status_Completed_InboundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Inbound call (${i?.duration})`)
};

const es_call_status_completed_inbound = /** @type {(inputs: Call_Status_Completed_InboundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Llamada entrante (${i?.duration})`)
};

/**
* | output |
* | --- |
* | "Inbound call ({duration})" |
*
* @param {Call_Status_Completed_InboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_completed_inbound = /** @type {((inputs: Call_Status_Completed_InboundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Status_Completed_InboundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_call_status_completed_inbound(inputs)
	return es_call_status_completed_inbound(inputs)
});