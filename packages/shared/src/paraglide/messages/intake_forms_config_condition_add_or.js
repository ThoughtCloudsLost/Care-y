/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Add_OrInputs */

const en_intake_forms_config_condition_add_or = /** @type {(inputs: Intake_Forms_Config_Condition_Add_OrInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add OR condition`)
};

const es_intake_forms_config_condition_add_or = /** @type {(inputs: Intake_Forms_Config_Condition_Add_OrInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar condición O`)
};

const en_xa2_intake_forms_config_condition_add_or = /** @type {(inputs: Intake_Forms_Config_Condition_Add_OrInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd ÒR còndìtìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Add OR condition" |
*
* @param {Intake_Forms_Config_Condition_Add_OrInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_add_or = /** @type {((inputs?: Intake_Forms_Config_Condition_Add_OrInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Add_OrInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_add_or(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_add_or(inputs)
	return en_intake_forms_config_condition_add_or(inputs)
});