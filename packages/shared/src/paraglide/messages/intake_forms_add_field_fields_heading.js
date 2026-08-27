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

/**
* | output |
* | --- |
* | "Fields" |
*
* @param {Intake_Forms_Add_Field_Fields_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_add_field_fields_heading = /** @type {((inputs?: Intake_Forms_Add_Field_Fields_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Add_Field_Fields_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_add_field_fields_heading(inputs)
	return es_intake_forms_add_field_fields_heading(inputs)
});