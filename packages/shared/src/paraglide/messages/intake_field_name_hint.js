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

const en_xa2_intake_field_name_hint = /** @type {(inputs: Intake_Field_Name_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦òptìònàl •••⟧`)
};

/**
* | output |
* | --- |
* | "optional" |
*
* @param {Intake_Field_Name_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_field_name_hint = /** @type {((inputs?: Intake_Field_Name_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Field_Name_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_field_name_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_field_name_hint(inputs)
	return en_intake_field_name_hint(inputs)
});