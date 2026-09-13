/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_Not_IncludesInputs */

const en_intake_forms_config_condition_op_not_includes = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Not_IncludesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`does not include`)
};

const es_intake_forms_config_condition_op_not_includes = /** @type {(inputs: Intake_Forms_Config_Condition_Op_Not_IncludesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`no incluye`)
};

/**
* | output |
* | --- |
* | "does not include" |
*
* @param {Intake_Forms_Config_Condition_Op_Not_IncludesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_not_includes = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_Not_IncludesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_Not_IncludesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_op_not_includes(inputs)
	return es_intake_forms_config_condition_op_not_includes(inputs)
});