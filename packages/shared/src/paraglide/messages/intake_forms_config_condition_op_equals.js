/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_EqualsInputs */

const en_intake_forms_config_condition_op_equals = /** @type {(inputs: Intake_Forms_Config_Condition_Op_EqualsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`equals`)
};

const es_intake_forms_config_condition_op_equals = /** @type {(inputs: Intake_Forms_Config_Condition_Op_EqualsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`es igual a`)
};

const en_xa2_intake_forms_config_condition_op_equals = /** @type {(inputs: Intake_Forms_Config_Condition_Op_EqualsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦èqùàls ••⟧`)
};

/**
* | output |
* | --- |
* | "equals" |
*
* @param {Intake_Forms_Config_Condition_Op_EqualsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_equals = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_EqualsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_EqualsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_op_equals(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_op_equals(inputs)
	return en_intake_forms_config_condition_op_equals(inputs)
});