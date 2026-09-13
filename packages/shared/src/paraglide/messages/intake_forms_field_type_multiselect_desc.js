/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_Multiselect_DescInputs */

const en_intake_forms_field_type_multiselect_desc = /** @type {(inputs: Intake_Forms_Field_Type_Multiselect_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose one or more options`)
};

const es_intake_forms_field_type_multiselect_desc = /** @type {(inputs: Intake_Forms_Field_Type_Multiselect_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elegir una o mas opciones`)
};

/**
* | output |
* | --- |
* | "Choose one or more options" |
*
* @param {Intake_Forms_Field_Type_Multiselect_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_multiselect_desc = /** @type {((inputs?: Intake_Forms_Field_Type_Multiselect_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_Multiselect_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_multiselect_desc(inputs)
	return es_intake_forms_field_type_multiselect_desc(inputs)
});