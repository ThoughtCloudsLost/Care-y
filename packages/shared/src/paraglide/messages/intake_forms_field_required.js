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

const en_xa2_intake_forms_field_required = /** @type {(inputs: Intake_Forms_Field_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦rèqùìrèd •••⟧`)
};

/**
* | output |
* | --- |
* | "required" |
*
* @param {Intake_Forms_Field_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_required = /** @type {((inputs?: Intake_Forms_Field_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_required(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_required(inputs)
	return en_intake_forms_field_required(inputs)
});