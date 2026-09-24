/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ max: NonNullable<unknown> }} Intake_Forms_Field_Row_Max_LengthInputs */

const en_intake_forms_field_row_max_length = /** @type {(inputs: Intake_Forms_Field_Row_Max_LengthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Max length: ${i?.max}`)
};

const es_intake_forms_field_row_max_length = /** @type {(inputs: Intake_Forms_Field_Row_Max_LengthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Largo máximo: ${i?.max}`)
};

const en_xa2_intake_forms_field_row_max_length = /** @type {(inputs: Intake_Forms_Field_Row_Max_LengthInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Màx lèngth:  ••••${i?.max}⟧`)
};

/**
* | output |
* | --- |
* | "Max length: {max}" |
*
* @param {Intake_Forms_Field_Row_Max_LengthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_max_length = /** @type {((inputs: Intake_Forms_Field_Row_Max_LengthInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_Max_LengthInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_row_max_length(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_row_max_length(inputs)
	return en_intake_forms_field_row_max_length(inputs)
});