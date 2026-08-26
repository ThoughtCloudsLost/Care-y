/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ date: NonNullable<unknown> }} Intake_Responses_Submitted_AtInputs */

const en_intake_responses_submitted_at = /** @type {(inputs: Intake_Responses_Submitted_AtInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Submitted ${i?.date}`)
};

const es_intake_responses_submitted_at = /** @type {(inputs: Intake_Responses_Submitted_AtInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Enviado ${i?.date}`)
};

/**
* | output |
* | --- |
* | "Submitted {date}" |
*
* @param {Intake_Responses_Submitted_AtInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_submitted_at = /** @type {((inputs: Intake_Responses_Submitted_AtInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Submitted_AtInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_submitted_at(inputs)
	return es_intake_responses_submitted_at(inputs)
});