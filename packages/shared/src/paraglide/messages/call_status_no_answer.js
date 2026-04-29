/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Call_Status_No_AnswerInputs */

const en_call_status_no_answer = /** @type {(inputs: Call_Status_No_AnswerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No answer`)
};

const es_call_status_no_answer = /** @type {(inputs: Call_Status_No_AnswerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin respuesta`)
};

/**
* | output |
* | --- |
* | "No answer" |
*
* @param {Call_Status_No_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_no_answer = /** @type {((inputs?: Call_Status_No_AnswerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Status_No_AnswerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_call_status_no_answer(inputs)
	return es_call_status_no_answer(inputs)
});