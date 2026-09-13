/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Field_Name_LabelInputs */

const en_intake_field_name_label = /** @type {(inputs: Intake_Field_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your name`)
};

const es_intake_field_name_label = /** @type {(inputs: Intake_Field_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu nombre`)
};

/**
* | output |
* | --- |
* | "Your name" |
*
* @param {Intake_Field_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_field_name_label = /** @type {((inputs?: Intake_Field_Name_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Field_Name_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_field_name_label(inputs)
	return es_intake_field_name_label(inputs)
});