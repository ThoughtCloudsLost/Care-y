/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ n: NonNullable<unknown> }} Intake_Forms_Config_Option_LabelInputs */

const en_intake_forms_config_option_label = /** @type {(inputs: Intake_Forms_Config_Option_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Option ${i?.n}`)
};

const es_intake_forms_config_option_label = /** @type {(inputs: Intake_Forms_Config_Option_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Opcion ${i?.n}`)
};

/**
* | output |
* | --- |
* | "Option {n}" |
*
* @param {Intake_Forms_Config_Option_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_option_label = /** @type {((inputs: Intake_Forms_Config_Option_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Option_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_option_label(inputs)
	return es_intake_forms_config_option_label(inputs)
});