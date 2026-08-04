/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Call_Status_CompletedInputs */

const en_logs_call_status_completed = /** @type {(inputs: Logs_Call_Status_CompletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Completed`)
};

const es_logs_call_status_completed = /** @type {(inputs: Logs_Call_Status_CompletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Completada`)
};

/**
* | output |
* | --- |
* | "Completed" |
*
* @param {Logs_Call_Status_CompletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_completed = /** @type {((inputs?: Logs_Call_Status_CompletedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Call_Status_CompletedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_call_status_completed(inputs)
	return es_logs_call_status_completed(inputs)
});