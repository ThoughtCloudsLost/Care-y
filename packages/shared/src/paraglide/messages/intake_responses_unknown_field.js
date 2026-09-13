/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Unknown_FieldInputs */

const en_intake_responses_unknown_field = /** @type {(inputs: Intake_Responses_Unknown_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unknown field`)
};

const es_intake_responses_unknown_field = /** @type {(inputs: Intake_Responses_Unknown_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Campo desconocido`)
};

/**
* | output |
* | --- |
* | "Unknown field" |
*
* @param {Intake_Responses_Unknown_FieldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_unknown_field = /** @type {((inputs?: Intake_Responses_Unknown_FieldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Unknown_FieldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_unknown_field(inputs)
	return es_intake_responses_unknown_field(inputs)
});