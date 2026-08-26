/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ max: NonNullable<unknown> }} Intake_Forms_Field_Row_Max_OnlyInputs */

const en_intake_forms_field_row_max_only = /** @type {(inputs: Intake_Forms_Field_Row_Max_OnlyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Max: ${i?.max}`)
};

const es_intake_forms_field_row_max_only = /** @type {(inputs: Intake_Forms_Field_Row_Max_OnlyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Max: ${i?.max}`)
};

/**
* | output |
* | --- |
* | "Max: {max}" |
*
* @param {Intake_Forms_Field_Row_Max_OnlyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_max_only = /** @type {((inputs: Intake_Forms_Field_Row_Max_OnlyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_Max_OnlyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_row_max_only(inputs)
	return es_intake_forms_field_row_max_only(inputs)
});