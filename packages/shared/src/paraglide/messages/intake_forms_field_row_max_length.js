/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ max: NonNullable<unknown> }} Intake_Forms_Field_Row_Max_LengthInputs */

const en_intake_forms_field_row_max_length = /** @type {(inputs: Intake_Forms_Field_Row_Max_LengthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Max length: ${i?.max}`)
};

const es_intake_forms_field_row_max_length = /** @type {(inputs: Intake_Forms_Field_Row_Max_LengthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Largo maximo: ${i?.max}`)
};

/**
* | output |
* | --- |
* | "Max length: {max}" |
*
* @param {Intake_Forms_Field_Row_Max_LengthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_max_length = /** @type {((inputs: Intake_Forms_Field_Row_Max_LengthInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_Max_LengthInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_row_max_length(inputs)
	return es_intake_forms_field_row_max_length(inputs)
});