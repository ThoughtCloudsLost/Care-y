/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Add_RuleInputs */

const en_intake_forms_config_condition_add_rule = /** @type {(inputs: Intake_Forms_Config_Condition_Add_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add condition`)
};

const es_intake_forms_config_condition_add_rule = /** @type {(inputs: Intake_Forms_Config_Condition_Add_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar condicion`)
};

/**
* | output |
* | --- |
* | "Add condition" |
*
* @param {Intake_Forms_Config_Condition_Add_RuleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_add_rule = /** @type {((inputs?: Intake_Forms_Config_Condition_Add_RuleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Add_RuleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_add_rule(inputs)
	return es_intake_forms_config_condition_add_rule(inputs)
});