/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Field_Name_HintInputs */

const en_intake_field_name_hint = /** @type {(inputs: Intake_Field_Name_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`optional`)
};

const es_intake_field_name_hint = /** @type {(inputs: Intake_Field_Name_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`opcional`)
};

/**
* | output |
* | --- |
* | "optional" |
*
* @param {Intake_Field_Name_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_field_name_hint = /** @type {((inputs?: Intake_Field_Name_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Field_Name_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_field_name_hint(inputs)
	return es_intake_field_name_hint(inputs)
});