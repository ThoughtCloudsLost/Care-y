/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_EmptyInputs */

const en_intake_responses_empty = /** @type {(inputs: Intake_Responses_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No responses have been submitted for this form.`)
};

const es_intake_responses_empty = /** @type {(inputs: Intake_Responses_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se han enviado respuestas para este formulario.`)
};

/**
* | output |
* | --- |
* | "No responses have been submitted for this form." |
*
* @param {Intake_Responses_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_empty = /** @type {((inputs?: Intake_Responses_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_empty(inputs)
	return es_intake_responses_empty(inputs)
});