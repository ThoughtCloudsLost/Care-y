/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_DateInputs */

const en_intake_forms_field_type_date = /** @type {(inputs: Intake_Forms_Field_Type_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date`)
};

const es_intake_forms_field_type_date = /** @type {(inputs: Intake_Forms_Field_Type_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha`)
};

/**
* | output |
* | --- |
* | "Date" |
*
* @param {Intake_Forms_Field_Type_DateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_date = /** @type {((inputs?: Intake_Forms_Field_Type_DateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_DateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_date(inputs)
	return es_intake_forms_field_type_date(inputs)
});