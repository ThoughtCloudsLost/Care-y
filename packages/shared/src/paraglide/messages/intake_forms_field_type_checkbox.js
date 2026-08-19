/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_CheckboxInputs */

const en_intake_forms_field_type_checkbox = /** @type {(inputs: Intake_Forms_Field_Type_CheckboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Checkbox`)
};

const es_intake_forms_field_type_checkbox = /** @type {(inputs: Intake_Forms_Field_Type_CheckboxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Casilla de verificacion`)
};

/**
* | output |
* | --- |
* | "Checkbox" |
*
* @param {Intake_Forms_Field_Type_CheckboxInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_checkbox = /** @type {((inputs?: Intake_Forms_Field_Type_CheckboxInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_CheckboxInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_checkbox(inputs)
	return es_intake_forms_field_type_checkbox(inputs)
});