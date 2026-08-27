/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Add_Field_Structure_HeadingInputs */

const en_intake_forms_add_field_structure_heading = /** @type {(inputs: Intake_Forms_Add_Field_Structure_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Structure`)
};

const es_intake_forms_add_field_structure_heading = /** @type {(inputs: Intake_Forms_Add_Field_Structure_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estructura`)
};

/**
* | output |
* | --- |
* | "Structure" |
*
* @param {Intake_Forms_Add_Field_Structure_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_add_field_structure_heading = /** @type {((inputs?: Intake_Forms_Add_Field_Structure_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Add_Field_Structure_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_add_field_structure_heading(inputs)
	return es_intake_forms_add_field_structure_heading(inputs)
});