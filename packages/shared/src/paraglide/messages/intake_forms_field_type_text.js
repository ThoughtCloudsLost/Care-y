/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_TextInputs */

const en_intake_forms_field_type_text = /** @type {(inputs: Intake_Forms_Field_Type_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text`)
};

const es_intake_forms_field_type_text = /** @type {(inputs: Intake_Forms_Field_Type_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto`)
};

const en_xa2_intake_forms_field_type_text = /** @type {(inputs: Intake_Forms_Field_Type_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèxt ••⟧`)
};

/**
* | output |
* | --- |
* | "Text" |
*
* @param {Intake_Forms_Field_Type_TextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_text = /** @type {((inputs?: Intake_Forms_Field_Type_TextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_TextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_type_text(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_type_text(inputs)
	return en_intake_forms_field_type_text(inputs)
});