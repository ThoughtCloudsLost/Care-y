/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_Page_Break_DescInputs */

const en_intake_forms_field_type_page_break_desc = /** @type {(inputs: Intake_Forms_Field_Type_Page_Break_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Split the form into pages`)
};

const es_intake_forms_field_type_page_break_desc = /** @type {(inputs: Intake_Forms_Field_Type_Page_Break_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Divide el formulario en paginas`)
};

/**
* | output |
* | --- |
* | "Split the form into pages" |
*
* @param {Intake_Forms_Field_Type_Page_Break_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_page_break_desc = /** @type {((inputs?: Intake_Forms_Field_Type_Page_Break_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_Page_Break_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_page_break_desc(inputs)
	return es_intake_forms_field_type_page_break_desc(inputs)
});