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

/**
* | output |
* | --- |
* | "optional" |
*
* @param {Intake_Forms_Field_OptionalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_optional = /** @type {((inputs?: Intake_Forms_Field_OptionalInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_OptionalInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_optional(inputs)
	return es_intake_forms_field_optional(inputs)
});