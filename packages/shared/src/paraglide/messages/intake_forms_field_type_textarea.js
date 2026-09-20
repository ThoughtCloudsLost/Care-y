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

const en_xa2_intake_forms_field_type_textarea = /** @type {(inputs: Intake_Forms_Field_Type_TextareaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèxt àrèà •••⟧`)
};

/**
* | output |
* | --- |
* | "Text area" |
*
* @param {Intake_Forms_Field_Type_TextareaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_textarea = /** @type {((inputs?: Intake_Forms_Field_Type_TextareaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_TextareaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_type_textarea(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_type_textarea(inputs)
	return en_intake_forms_field_type_textarea(inputs)
});