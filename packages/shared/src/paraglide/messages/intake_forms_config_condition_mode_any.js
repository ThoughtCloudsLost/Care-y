/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Mode_AnyInputs */

const en_intake_forms_config_condition_mode_any = /** @type {(inputs: Intake_Forms_Config_Condition_Mode_AnyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Any condition matches`)
};

const es_intake_forms_config_condition_mode_any = /** @type {(inputs: Intake_Forms_Config_Condition_Mode_AnyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cualquier condicion se cumple`)
};

/**
* | output |
* | --- |
* | "Any condition matches" |
*
* @param {Intake_Forms_Config_Condition_Mode_AnyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_mode_any = /** @type {((inputs?: Intake_Forms_Config_Condition_Mode_AnyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Mode_AnyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_mode_any(inputs)
	return es_intake_forms_config_condition_mode_any(inputs)
});