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

/**
* | output |
* | --- |
* | "Canceled" |
*
* @param {Logs_Call_Status_CanceledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_canceled = /** @type {((inputs?: Logs_Call_Status_CanceledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Call_Status_CanceledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_call_status_canceled(inputs)
	return es_logs_call_status_canceled(inputs)
});