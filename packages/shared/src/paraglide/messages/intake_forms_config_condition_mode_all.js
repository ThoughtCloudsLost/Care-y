/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Mode_AllInputs */

const en_intake_forms_config_condition_mode_all = /** @type {(inputs: Intake_Forms_Config_Condition_Mode_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All conditions must match`)
};

const es_intake_forms_config_condition_mode_all = /** @type {(inputs: Intake_Forms_Config_Condition_Mode_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todas las condiciones deben cumplirse`)
};

/**
* | output |
* | --- |
* | "All conditions must match" |
*
* @param {Intake_Forms_Config_Condition_Mode_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_mode_all = /** @type {((inputs?: Intake_Forms_Config_Condition_Mode_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Mode_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_mode_all(inputs)
	return es_intake_forms_config_condition_mode_all(inputs)
});