/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_SelectInputs */

const en_intake_forms_field_type_select = /** @type {(inputs: Intake_Forms_Field_Type_SelectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dropdown`)
};

const es_intake_forms_field_type_select = /** @type {(inputs: Intake_Forms_Field_Type_SelectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista desplegable`)
};

/**
* | output |
* | --- |
* | "Dropdown" |
*
* @param {Intake_Forms_Field_Type_SelectInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_select = /** @type {((inputs?: Intake_Forms_Field_Type_SelectInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_SelectInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_select(inputs)
	return es_intake_forms_field_type_select(inputs)
});