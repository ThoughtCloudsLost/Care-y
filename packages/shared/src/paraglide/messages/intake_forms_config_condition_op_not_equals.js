/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_Not_EqualsInputs */

const en_intake_forms_config_condition_op_not_equals = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Not_EqualsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`does not equal`)
};

const es_intake_forms_config_condition_op_not_equals = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Not_EqualsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`no es igual a`)
};

/**
* | output |
* | --- |
* | "does not equal" |
*
* @param {Intake_Forms_Config_Condition_Op_Not_EqualsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_not_equals = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_Not_EqualsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_Not_EqualsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_op_not_equals(inputs)
	return es_intake_forms_config_condition_op_not_equals(inputs)
});