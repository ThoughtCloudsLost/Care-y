/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Remove_RuleInputs */

const en_intake_forms_config_condition_remove_rule = /** @type {(inputs: Intake_Forms_Config_Condition_Remove_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove condition`)
};

const es_intake_forms_config_condition_remove_rule = /** @type {(inputs: Intake_Forms_Config_Condition_Remove_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar condicion`)
};

/**
* | output |
* | --- |
* | "Remove condition" |
*
* @param {Intake_Forms_Config_Condition_Remove_RuleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_remove_rule = /** @type {((inputs?: Intake_Forms_Config_Condition_Remove_RuleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Remove_RuleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_remove_rule(inputs)
	return es_intake_forms_config_condition_remove_rule(inputs)
});