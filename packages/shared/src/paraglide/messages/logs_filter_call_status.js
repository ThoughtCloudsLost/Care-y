/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Filter_Call_StatusInputs */

const en_logs_filter_call_status = /** @type {(inputs: Logs_Filter_Call_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call status`)
};

const es_logs_filter_call_status = /** @type {(inputs: Logs_Filter_Call_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado de llamada`)
};

/**
* | output |
* | --- |
* | "Call status" |
*
* @param {Logs_Filter_Call_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_filter_call_status = /** @type {((inputs?: Logs_Filter_Call_StatusInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Filter_Call_StatusInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_filter_call_status(inputs)
	return es_logs_filter_call_status(inputs)
});