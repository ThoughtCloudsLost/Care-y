/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_TextareaInputs */

const en_intake_forms_field_type_textarea = /** @type {(inputs: Intake_Forms_Field_Type_TextareaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text area`)
};

const es_intake_forms_field_type_textarea = /** @type {(inputs: Intake_Forms_Field_Type_TextareaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Area de texto`)
};

/**
* | output |
* | --- |
* | "Text area" |
*
* @param {Intake_Forms_Field_Type_TextareaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_textarea = /** @type {((inputs?: Intake_Forms_Field_Type_TextareaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_TextareaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_textarea(inputs)
	return es_intake_forms_field_type_textarea(inputs)
});