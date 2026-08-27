/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_Add_AndInputs */

const en_intake_forms_config_condition_add_and = /** @type {(inputs: Intake_Forms_Config_Condition_Add_AndInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add AND condition`)
};

const es_intake_forms_config_condition_add_and = /** @type {(inputs: Intake_Forms_Config_Condition_Add_AndInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar condición Y`)
};

/**
* | output |
* | --- |
* | "Add AND condition" |
*
* @param {Intake_Forms_Config_Condition_Add_AndInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_add_and = /** @type {((inputs?: Intake_Forms_Config_Condition_Add_AndInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_Add_AndInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_add_and(inputs)
	return es_intake_forms_config_condition_add_and(inputs)
});