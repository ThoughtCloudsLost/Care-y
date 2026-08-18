/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_RequiredInputs */

const en_intake_forms_field_required = /** @type {(inputs: Intake_Forms_Field_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`required`)
};

const es_intake_forms_field_required = /** @type {(inputs: Intake_Forms_Field_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`obligatorio`)
};

/**
* | output |
* | --- |
* | "required" |
*
* @param {Intake_Forms_Field_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_required = /** @type {((inputs?: Intake_Forms_Field_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_required(inputs)
	return es_intake_forms_field_required(inputs)
});