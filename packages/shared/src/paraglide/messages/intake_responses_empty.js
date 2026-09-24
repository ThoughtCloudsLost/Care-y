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

const en_xa2_intake_responses_empty = /** @type {(inputs: Intake_Responses_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò rèspònsès hàvè bèèn sùbmìttèd fòr thìs fòrm. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No responses have been submitted for this form." |
*
* @param {Intake_Responses_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_empty = /** @type {((inputs?: Intake_Responses_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_empty(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_empty(inputs)
	return en_intake_responses_empty(inputs)
});