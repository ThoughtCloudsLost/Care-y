/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ min: NonNullable<unknown> }} Intake_Error_Number_MinInputs */

const en_intake_error_number_min = /** @type {(inputs: Intake_Error_Number_MinInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Value must be at least ${i?.min}.`)
};

const es_intake_error_number_min = /** @type {(inputs: Intake_Error_Number_MinInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El valor debe ser al menos ${i?.min}.`)
};

/**
* | output |
* | --- |
* | "Value must be at least {min}." |
*
* @param {Intake_Error_Number_MinInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_number_min = /** @type {((inputs: Intake_Error_Number_MinInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Number_MinInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_number_min(inputs)
	return es_intake_error_number_min(inputs)
});