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

/**
* | output |
* | --- |
* | "equals" |
*
* @param {Intake_Forms_Config_Condition_Op_EqualsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_equals = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_EqualsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_EqualsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_op_equals(inputs)
	return es_intake_forms_config_condition_op_equals(inputs)
});