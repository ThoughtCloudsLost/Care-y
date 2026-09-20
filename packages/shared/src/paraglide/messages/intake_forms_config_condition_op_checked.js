/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_CheckedInputs */

const en_intake_forms_config_condition_op_checked = /** @type {(inputs: Intake_Forms_Config_Condition_Op_CheckedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`is checked`)
};

const es_intake_forms_config_condition_op_checked = /** @type {(inputs: Intake_Forms_Config_Condition_Op_CheckedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`está marcado`)
};

const en_xa2_intake_forms_config_condition_op_checked = /** @type {(inputs: Intake_Forms_Config_Condition_Op_CheckedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ìs chèckèd •••⟧`)
};

/**
* | output |
* | --- |
* | "is checked" |
*
* @param {Intake_Forms_Config_Condition_Op_CheckedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_checked = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_CheckedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_CheckedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_op_checked(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_op_checked(inputs)
	return en_intake_forms_config_condition_op_checked(inputs)
});