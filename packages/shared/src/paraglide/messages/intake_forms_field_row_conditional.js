/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ field: NonNullable<unknown> }} Intake_Forms_Field_Row_ConditionalInputs */

const en_intake_forms_field_row_conditional = /** @type {(inputs: Intake_Forms_Field_Row_ConditionalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Conditional on: ${i?.field}`)
};

const es_intake_forms_field_row_conditional = /** @type {(inputs: Intake_Forms_Field_Row_ConditionalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Condicional en: ${i?.field}`)
};

/**
* | output |
* | --- |
* | "Conditional on: {field}" |
*
* @param {Intake_Forms_Field_Row_ConditionalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_conditional = /** @type {((inputs: Intake_Forms_Field_Row_ConditionalInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_ConditionalInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_row_conditional(inputs)
	return es_intake_forms_field_row_conditional(inputs)
});