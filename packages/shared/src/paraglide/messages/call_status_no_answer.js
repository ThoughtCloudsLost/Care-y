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

const en_xa2_call_status_no_answer = /** @type {(inputs: Call_Status_No_AnswerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò ànswèr •••⟧`)
};

/**
* | output |
* | --- |
* | "No answer" |
*
* @param {Call_Status_No_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const call_status_no_answer = /** @type {((inputs?: Call_Status_No_AnswerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Status_No_AnswerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_call_status_no_answer(inputs)
	if (locale === "en-XA") return en_xa2_call_status_no_answer(inputs)
	return en_call_status_no_answer(inputs)
});