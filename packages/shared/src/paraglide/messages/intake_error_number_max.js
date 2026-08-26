/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ max: NonNullable<unknown> }} Intake_Error_Number_MaxInputs */

const en_intake_error_number_max = /** @type {(inputs: Intake_Error_Number_MaxInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Value must be at most ${i?.max}.`)
};

const es_intake_error_number_max = /** @type {(inputs: Intake_Error_Number_MaxInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El valor debe ser como maximo ${i?.max}.`)
};

/**
* | output |
* | --- |
* | "Value must be at most {max}." |
*
* @param {Intake_Error_Number_MaxInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_number_max = /** @type {((inputs: Intake_Error_Number_MaxInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Number_MaxInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_number_max(inputs)
	return es_intake_error_number_max(inputs)
});