/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_Checkbox_DescInputs */

const en_intake_forms_field_type_checkbox_desc = /** @type {(inputs: Intake_Forms_Field_Type_Checkbox_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Single yes/no toggle`)
};

const es_intake_forms_field_type_checkbox_desc = /** @type {(inputs: Intake_Forms_Field_Type_Checkbox_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccion si/no`)
};

/**
* | output |
* | --- |
* | "Single yes/no toggle" |
*
* @param {Intake_Forms_Field_Type_Checkbox_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_checkbox_desc = /** @type {((inputs?: Intake_Forms_Field_Type_Checkbox_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_Checkbox_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_checkbox_desc(inputs)
	return es_intake_forms_field_type_checkbox_desc(inputs)
});