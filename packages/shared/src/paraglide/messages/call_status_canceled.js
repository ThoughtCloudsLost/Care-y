/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Call_Status_CanceledInputs */

const en_call_status_canceled = /** @type {(inputs: Call_Status_CanceledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call canceled`)
};

const es_call_status_canceled = /** @type {(inputs: Call_Status_CanceledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamada cancelada`)
};

/**
* | output |
* | --- |
* | "Call canceled" |
*
* @param {Call_Status_CanceledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_canceled = /** @type {((inputs?: Call_Status_CanceledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Status_CanceledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_call_status_canceled(inputs)
	return es_call_status_canceled(inputs)
});