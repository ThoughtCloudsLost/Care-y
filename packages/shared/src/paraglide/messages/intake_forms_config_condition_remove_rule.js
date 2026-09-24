/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Remove_RuleInputs */

const en_intake_forms_config_condition_remove_rule = /** @type {(inputs: Intake_Forms_Config_Condition_Remove_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove condition`)
};

const es_intake_forms_config_condition_remove_rule = /** @type {(inputs: Intake_Forms_Config_Condition_Remove_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar condición`)
};

const en_xa2_intake_forms_config_condition_remove_rule = /** @type {(inputs: Intake_Forms_Config_Condition_Remove_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè còndìtìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove condition" |
*
* @param {Intake_Forms_Config_Condition_Remove_RuleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_remove_rule = /** @type {((inputs?: Intake_Forms_Config_Condition_Remove_RuleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Remove_RuleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_remove_rule(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_remove_rule(inputs)
	return en_intake_forms_config_condition_remove_rule(inputs)
});