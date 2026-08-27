/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_Is_EmptyInputs */

const en_intake_forms_config_condition_op_is_empty = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Is_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`is empty`)
};

const es_intake_forms_config_condition_op_is_empty = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Is_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`está vacío`)
};

/**
* | output |
* | --- |
* | "is empty" |
*
* @param {Intake_Forms_Config_Condition_Op_Is_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_is_empty = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_Is_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_Is_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_op_is_empty(inputs)
	return es_intake_forms_config_condition_op_is_empty(inputs)
});