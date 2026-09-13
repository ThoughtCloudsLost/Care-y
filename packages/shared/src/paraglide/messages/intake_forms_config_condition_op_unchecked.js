/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Op_UncheckedInputs */

const en_intake_forms_config_condition_op_unchecked = /** @type {(inputs: Intake_Forms_Config_Condition_Op_UncheckedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`is unchecked`)
};

const es_intake_forms_config_condition_op_unchecked = /** @type {(inputs: Intake_Forms_Config_Condition_Op_UncheckedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`no está marcado`)
};

/**
* | output |
* | --- |
* | "is unchecked" |
*
* @param {Intake_Forms_Config_Condition_Op_UncheckedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_op_unchecked = /** @type {((inputs?: Intake_Forms_Config_Condition_Op_UncheckedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Op_UncheckedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_op_unchecked(inputs)
	return es_intake_forms_config_condition_op_unchecked(inputs)
});