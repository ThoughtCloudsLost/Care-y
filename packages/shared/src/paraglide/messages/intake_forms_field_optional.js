/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_OptionalInputs */

const en_intake_forms_field_optional = /** @type {(inputs: Intake_Forms_Field_OptionalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`optional`)
};

const es_intake_forms_field_optional = /** @type {(inputs: Intake_Forms_Field_OptionalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`opcional`)
};

const en_xa2_intake_forms_field_optional = /** @type {(inputs: Intake_Forms_Field_OptionalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦òptìònàl •••⟧`)
};

/**
* | output |
* | --- |
* | "optional" |
*
* @param {Intake_Forms_Field_OptionalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_optional = /** @type {((inputs?: Intake_Forms_Field_OptionalInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_OptionalInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_optional(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_optional(inputs)
	return en_intake_forms_field_optional(inputs)
});