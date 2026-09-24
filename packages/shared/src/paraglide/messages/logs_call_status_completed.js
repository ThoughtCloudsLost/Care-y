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

const en_xa2_logs_call_status_completed = /** @type {(inputs: Logs_Call_Status_CompletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmplètèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Completed" |
*
* @param {Logs_Call_Status_CompletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_completed = /** @type {((inputs?: Logs_Call_Status_CompletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Call_Status_CompletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_call_status_completed(inputs)
	if (locale === "en-XA") return en_xa2_logs_call_status_completed(inputs)
	return en_logs_call_status_completed(inputs)
});