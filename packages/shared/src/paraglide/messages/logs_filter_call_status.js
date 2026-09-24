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

const en_xa2_logs_filter_call_status = /** @type {(inputs: Logs_Filter_Call_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll stàtùs ••••⟧`)
};

/**
* | output |
* | --- |
* | "Call status" |
*
* @param {Logs_Filter_Call_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_filter_call_status = /** @type {((inputs?: Logs_Filter_Call_StatusInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Filter_Call_StatusInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_filter_call_status(inputs)
	if (locale === "en-XA") return en_xa2_logs_filter_call_status(inputs)
	return en_logs_filter_call_status(inputs)
});