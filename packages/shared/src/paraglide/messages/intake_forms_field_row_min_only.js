/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ min: NonNullable<unknown> }} Intake_Forms_Field_Row_Min_OnlyInputs */

const en_intake_forms_field_row_min_only = /** @type {(inputs: Intake_Forms_Field_Row_Min_OnlyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Min: ${i?.min}`)
};

const es_intake_forms_field_row_min_only = /** @type {(inputs: Intake_Forms_Field_Row_Min_OnlyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Min: ${i?.min}`)
};

const en_xa2_intake_forms_field_row_min_only = /** @type {(inputs: Intake_Forms_Field_Row_Min_OnlyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Mìn:  ••${i?.min}⟧`)
};

/**
* | output |
* | --- |
* | "Min: {min}" |
*
* @param {Intake_Forms_Field_Row_Min_OnlyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_min_only = /** @type {((inputs: Intake_Forms_Field_Row_Min_OnlyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_Min_OnlyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_row_min_only(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_row_min_only(inputs)
	return en_intake_forms_field_row_min_only(inputs)
});