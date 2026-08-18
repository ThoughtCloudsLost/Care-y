/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_One_AvailabilityInputs */

const en_intake_forms_one_availability = /** @type {(inputs: Intake_Forms_One_AvailabilityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`One availability field per form.`)
};

const es_intake_forms_one_availability = /** @type {(inputs: Intake_Forms_One_AvailabilityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un campo de disponibilidad por formulario.`)
};

/**
* | output |
* | --- |
* | "One availability field per form." |
*
* @param {Intake_Forms_One_AvailabilityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_one_availability = /** @type {((inputs?: Intake_Forms_One_AvailabilityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_One_AvailabilityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_one_availability(inputs)
	return es_intake_forms_one_availability(inputs)
});