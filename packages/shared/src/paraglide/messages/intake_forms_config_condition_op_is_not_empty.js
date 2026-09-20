/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_Is_Not_EmptyInputs */

const en_intake_forms_config_condition_op_is_not_empty = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Is_Not_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`is not empty`)
};

const es_intake_forms_config_condition_op_is_not_empty = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Is_Not_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`no está vacío`)
};

const en_xa2_intake_forms_config_condition_op_is_not_empty = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Is_Not_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ìs nòt èmpty ••••⟧`)
};

/**
* | output |
* | --- |
* | "is not empty" |
*
* @param {Intake_Forms_Config_Condition_Op_Is_Not_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_is_not_empty = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_Is_Not_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_Is_Not_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_op_is_not_empty(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_op_is_not_empty(inputs)
	return en_intake_forms_config_condition_op_is_not_empty(inputs)
});