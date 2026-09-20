/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Add_Field_Fields_HeadingInputs */

const en_intake_forms_add_field_fields_heading = /** @type {(inputs: Intake_Forms_Add_Field_Fields_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fields`)
};

const es_intake_forms_add_field_fields_heading = /** @type {(inputs: Intake_Forms_Add_Field_Fields_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Campos`)
};

const en_xa2_intake_forms_add_field_fields_heading = /** @type {(inputs: Intake_Forms_Add_Field_Fields_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìèlds ••⟧`)
};

/**
* | output |
* | --- |
* | "Fields" |
*
* @param {Intake_Forms_Add_Field_Fields_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_add_field_fields_heading = /** @type {((inputs?: Intake_Forms_Add_Field_Fields_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Add_Field_Fields_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_add_field_fields_heading(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_add_field_fields_heading(inputs)
	return en_intake_forms_add_field_fields_heading(inputs)
});