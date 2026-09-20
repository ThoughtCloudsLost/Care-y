/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_Multiselect_DescInputs */

const en_intake_forms_field_type_multiselect_desc = /** @type {(inputs: Intake_Forms_Field_Type_Multiselect_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose one or more options`)
};

const es_intake_forms_field_type_multiselect_desc = /** @type {(inputs: Intake_Forms_Field_Type_Multiselect_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elegir una o más opciones`)
};

const en_xa2_intake_forms_field_type_multiselect_desc = /** @type {(inputs: Intake_Forms_Field_Type_Multiselect_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chòòsè ònè òr mòrè òptìòns ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choose one or more options" |
*
* @param {Intake_Forms_Field_Type_Multiselect_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_multiselect_desc = /** @type {((inputs?: Intake_Forms_Field_Type_Multiselect_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_Multiselect_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_type_multiselect_desc(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_type_multiselect_desc(inputs)
	return en_intake_forms_field_type_multiselect_desc(inputs)
});