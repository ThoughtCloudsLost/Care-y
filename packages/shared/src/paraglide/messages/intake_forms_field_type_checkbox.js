/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_CheckboxInputs */

const en_intake_forms_field_type_checkbox = /** @type {(inputs: Intake_Forms_Field_Type_CheckboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Checkbox`)
};

const es_intake_forms_field_type_checkbox = /** @type {(inputs: Intake_Forms_Field_Type_CheckboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Casilla de verificación`)
};

const en_xa2_intake_forms_field_type_checkbox = /** @type {(inputs: Intake_Forms_Field_Type_CheckboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chèckbòx •••⟧`)
};

/**
* | output |
* | --- |
* | "Checkbox" |
*
* @param {Intake_Forms_Field_Type_CheckboxInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_checkbox = /** @type {((inputs?: Intake_Forms_Field_Type_CheckboxInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_CheckboxInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_type_checkbox(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_type_checkbox(inputs)
	return en_intake_forms_field_type_checkbox(inputs)
});