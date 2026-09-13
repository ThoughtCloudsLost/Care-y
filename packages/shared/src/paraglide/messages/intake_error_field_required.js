/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Field_RequiredInputs */

const en_intake_error_field_required = /** @type {(inputs: Intake_Error_Field_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This field is required.`)
};

const es_intake_error_field_required = /** @type {(inputs: Intake_Error_Field_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este campo es obligatorio.`)
};

/**
* | output |
* | --- |
* | "This field is required." |
*
* @param {Intake_Error_Field_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_field_required = /** @type {((inputs?: Intake_Error_Field_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Field_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_field_required(inputs)
	return es_intake_error_field_required(inputs)
});