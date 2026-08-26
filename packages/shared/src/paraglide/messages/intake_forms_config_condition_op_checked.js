/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_CheckedInputs */

const en_intake_forms_config_condition_op_checked = /** @type {(inputs: Intake_Forms_Config_Condition_Op_CheckedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`is checked`)
};

const es_intake_forms_config_condition_op_checked = /** @type {(inputs: Intake_Forms_Config_Condition_Op_CheckedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`esta marcado`)
};

/**
* | output |
* | --- |
* | "is checked" |
*
* @param {Intake_Forms_Config_Condition_Op_CheckedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_checked = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_CheckedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_CheckedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_op_checked(inputs)
	return es_intake_forms_config_condition_op_checked(inputs)
});