/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Call_Status_FailedInputs */

const en_logs_call_status_failed = /** @type {(inputs: Logs_Call_Status_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed`)
};

const es_logs_call_status_failed = /** @type {(inputs: Logs_Call_Status_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fallida`)
};

/**
* | output |
* | --- |
* | "Failed" |
*
* @param {Logs_Call_Status_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_failed = /** @type {((inputs?: Logs_Call_Status_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Call_Status_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_call_status_failed(inputs)
	return es_logs_call_status_failed(inputs)
});