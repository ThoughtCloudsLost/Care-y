/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Call_Status_FailedInputs */

const en_call_status_failed = /** @type {(inputs: Call_Status_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call failed`)
};

const es_call_status_failed = /** @type {(inputs: Call_Status_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamada fallida`)
};

/**
* | output |
* | --- |
* | "Call failed" |
*
* @param {Call_Status_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_failed = /** @type {((inputs?: Call_Status_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Status_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_call_status_failed(inputs)
	return es_call_status_failed(inputs)
});