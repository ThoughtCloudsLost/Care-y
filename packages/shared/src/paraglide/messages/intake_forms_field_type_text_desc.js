/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_Text_DescInputs */

const en_intake_forms_field_type_text_desc = /** @type {(inputs: Intake_Forms_Field_Type_Text_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Single-line answer`)
};

const es_intake_forms_field_type_text_desc = /** @type {(inputs: Intake_Forms_Field_Type_Text_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta de una línea`)
};

const en_xa2_intake_forms_field_type_text_desc = /** @type {(inputs: Intake_Forms_Field_Type_Text_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìnglè-lìnè ànswèr ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Single-line answer" |
*
* @param {Intake_Forms_Field_Type_Text_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_text_desc = /** @type {((inputs?: Intake_Forms_Field_Type_Text_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_Text_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_type_text_desc(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_type_text_desc(inputs)
	return en_intake_forms_field_type_text_desc(inputs)
});