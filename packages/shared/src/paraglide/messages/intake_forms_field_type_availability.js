/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_AvailabilityInputs */

const en_intake_forms_field_type_availability = /** @type {(inputs: Intake_Forms_Field_Type_AvailabilityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Availability`)
};

const es_intake_forms_field_type_availability = /** @type {(inputs: Intake_Forms_Field_Type_AvailabilityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disponibilidad`)
};

/**
* | output |
* | --- |
* | "Availability" |
*
* @param {Intake_Forms_Field_Type_AvailabilityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_availability = /** @type {((inputs?: Intake_Forms_Field_Type_AvailabilityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_AvailabilityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_availability(inputs)
	return es_intake_forms_field_type_availability(inputs)
});