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

const en_xa2_intake_forms_field_type_date = /** @type {(inputs: Intake_Forms_Field_Type_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtè ••⟧`)
};

/**
* | output |
* | --- |
* | "Date" |
*
* @param {Intake_Forms_Field_Type_DateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_date = /** @type {((inputs?: Intake_Forms_Field_Type_DateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_DateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_type_date(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_type_date(inputs)
	return en_intake_forms_field_type_date(inputs)
});