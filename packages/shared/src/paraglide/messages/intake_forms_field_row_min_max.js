/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ min: NonNullable<unknown>, max: NonNullable<unknown> }} Intake_Forms_Field_Row_Min_MaxInputs */

const en_intake_forms_field_row_min_max = /** @type {(inputs: Intake_Forms_Field_Row_Min_MaxInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Range: ${i?.min} to ${i?.max}`)
};

const es_intake_forms_field_row_min_max = /** @type {(inputs: Intake_Forms_Field_Row_Min_MaxInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Rango: ${i?.min} a ${i?.max}`)
};

/**
* | output |
* | --- |
* | "Range: {min} to {max}" |
*
* @param {Intake_Forms_Field_Row_Min_MaxInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_min_max = /** @type {((inputs: Intake_Forms_Field_Row_Min_MaxInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_Min_MaxInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_row_min_max(inputs)
	return es_intake_forms_field_row_min_max(inputs)
});