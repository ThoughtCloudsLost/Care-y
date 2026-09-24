/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_IncludesInputs */

const en_intake_forms_config_condition_op_includes = /** @type {(inputs: Intake_Forms_Config_Condition_Op_IncludesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`includes`)
};

const es_intake_forms_config_condition_op_includes = /** @type {(inputs: Intake_Forms_Config_Condition_Op_IncludesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`incluye`)
};

const en_xa2_intake_forms_config_condition_op_includes = /** @type {(inputs: Intake_Forms_Config_Condition_Op_IncludesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ìnclùdès •••⟧`)
};

/**
* | output |
* | --- |
* | "includes" |
*
* @param {Intake_Forms_Config_Condition_Op_IncludesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_includes = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_IncludesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_IncludesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_op_includes(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_op_includes(inputs)
	return en_intake_forms_config_condition_op_includes(inputs)
});