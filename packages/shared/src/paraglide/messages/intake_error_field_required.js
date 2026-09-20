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

const en_xa2_intake_error_field_required = /** @type {(inputs: Intake_Error_Field_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fìèld ìs rèqùìrèd. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "This field is required." |
*
* @param {Intake_Error_Field_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_field_required = /** @type {((inputs?: Intake_Error_Field_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Field_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_error_field_required(inputs)
	if (locale === "en-XA") return en_xa2_intake_error_field_required(inputs)
	return en_intake_error_field_required(inputs)
});