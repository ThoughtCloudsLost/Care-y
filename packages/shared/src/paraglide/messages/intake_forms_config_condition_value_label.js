/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Value_LabelInputs */

const en_intake_forms_config_condition_value_label = /** @type {(inputs: Intake_Forms_Config_Condition_Value_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`value`)
};

const es_intake_forms_config_condition_value_label = /** @type {(inputs: Intake_Forms_Config_Condition_Value_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`valor`)
};

/**
* | output |
* | --- |
* | "value" |
*
* @param {Intake_Forms_Config_Condition_Value_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_value_label = /** @type {((inputs?: Intake_Forms_Config_Condition_Value_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Value_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_value_label(inputs)
	return es_intake_forms_config_condition_value_label(inputs)
});