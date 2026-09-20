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

const en_xa2_intake_forms_field_type_availability = /** @type {(inputs: Intake_Forms_Field_Type_AvailabilityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àvàìlàbìlìty ••••⟧`)
};

/**
* | output |
* | --- |
* | "Availability" |
*
* @param {Intake_Forms_Field_Type_AvailabilityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_availability = /** @type {((inputs?: Intake_Forms_Field_Type_AvailabilityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_AvailabilityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_type_availability(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_type_availability(inputs)
	return en_intake_forms_field_type_availability(inputs)
});