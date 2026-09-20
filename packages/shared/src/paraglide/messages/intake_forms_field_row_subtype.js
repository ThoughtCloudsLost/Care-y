/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ type: NonNullable<unknown>, subtype: NonNullable<unknown> }} Intake_Forms_Field_Row_SubtypeInputs */

const en_intake_forms_field_row_subtype = /** @type {(inputs: Intake_Forms_Field_Row_SubtypeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.type}: ${i?.subtype}`)
};

const es_intake_forms_field_row_subtype = /** @type {(inputs: Intake_Forms_Field_Row_SubtypeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.type}: ${i?.subtype}`)
};

const en_xa2_intake_forms_field_row_subtype = /** @type {(inputs: Intake_Forms_Field_Row_SubtypeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.type}:  •${i?.subtype}⟧`)
};

/**
* | output |
* | --- |
* | "{type}: {subtype}" |
*
* @param {Intake_Forms_Field_Row_SubtypeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_subtype = /** @type {((inputs: Intake_Forms_Field_Row_SubtypeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_SubtypeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_row_subtype(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_row_subtype(inputs)
	return en_intake_forms_field_row_subtype(inputs)
});