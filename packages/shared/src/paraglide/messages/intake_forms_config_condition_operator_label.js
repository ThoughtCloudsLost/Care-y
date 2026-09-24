/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Operator_LabelInputs */

const en_intake_forms_config_condition_operator_label = /** @type {(inputs: Intake_Forms_Config_Condition_Operator_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`is`)
};

const es_intake_forms_config_condition_operator_label = /** @type {(inputs: Intake_Forms_Config_Condition_Operator_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`es`)
};

const en_xa2_intake_forms_config_condition_operator_label = /** @type {(inputs: Intake_Forms_Config_Condition_Operator_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ìs •⟧`)
};

/**
* | output |
* | --- |
* | "is" |
*
* @param {Intake_Forms_Config_Condition_Operator_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_operator_label = /** @type {((inputs?: Intake_Forms_Config_Condition_Operator_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Operator_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_operator_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_operator_label(inputs)
	return en_intake_forms_config_condition_operator_label(inputs)
});