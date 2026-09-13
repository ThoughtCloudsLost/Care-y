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

/**
* | output |
* | --- |
* | "includes" |
*
* @param {Intake_Forms_Config_Condition_Op_IncludesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_includes = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_IncludesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_IncludesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_op_includes(inputs)
	return es_intake_forms_config_condition_op_includes(inputs)
});