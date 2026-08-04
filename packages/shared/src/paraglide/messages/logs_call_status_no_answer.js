/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Call_Status_No_AnswerInputs */

const en_logs_call_status_no_answer = /** @type {(inputs: Logs_Call_Status_No_AnswerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No answer`)
};

const es_logs_call_status_no_answer = /** @type {(inputs: Logs_Call_Status_No_AnswerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin respuesta`)
};

/**
* | output |
* | --- |
* | "No answer" |
*
* @param {Logs_Call_Status_No_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_no_answer = /** @type {((inputs?: Logs_Call_Status_No_AnswerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Call_Status_No_AnswerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_call_status_no_answer(inputs)
	return es_logs_call_status_no_answer(inputs)
});