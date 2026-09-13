/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Or_SeparatorInputs */

const en_intake_forms_config_condition_or_separator = /** @type {(inputs: Intake_Forms_Config_Condition_Or_SeparatorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`or`)
};

const es_intake_forms_config_condition_or_separator = /** @type {(inputs: Intake_Forms_Config_Condition_Or_SeparatorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`o`)
};

/**
* | output |
* | --- |
* | "or" |
*
* @param {Intake_Forms_Config_Condition_Or_SeparatorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_or_separator = /** @type {((inputs?: Intake_Forms_Config_Condition_Or_SeparatorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Or_SeparatorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_or_separator(inputs)
	return es_intake_forms_config_condition_or_separator(inputs)
});