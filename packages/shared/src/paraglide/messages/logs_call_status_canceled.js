/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Call_Status_CanceledInputs */

const en_logs_call_status_canceled = /** @type {(inputs: Logs_Call_Status_CanceledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Canceled`)
};

const es_logs_call_status_canceled = /** @type {(inputs: Logs_Call_Status_CanceledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancelada`)
};

const en_xa2_logs_call_status_canceled = /** @type {(inputs: Logs_Call_Status_CanceledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càncèlèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Canceled" |
*
* @param {Logs_Call_Status_CanceledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_canceled = /** @type {((inputs?: Logs_Call_Status_CanceledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Call_Status_CanceledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_call_status_canceled(inputs)
	if (locale === "en-XA") return en_xa2_logs_call_status_canceled(inputs)
	return en_logs_call_status_canceled(inputs)
});