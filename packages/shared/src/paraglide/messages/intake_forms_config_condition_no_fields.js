/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_No_FieldsInputs */

const en_intake_forms_config_condition_no_fields = /** @type {(inputs: Intake_Forms_Config_Condition_No_FieldsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No earlier fields available for conditions.`)
};

const es_intake_forms_config_condition_no_fields = /** @type {(inputs: Intake_Forms_Config_Condition_No_FieldsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay campos anteriores disponibles para condiciones.`)
};

/**
* | output |
* | --- |
* | "No earlier fields available for conditions." |
*
* @param {Intake_Forms_Config_Condition_No_FieldsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_no_fields = /** @type {((inputs?: Intake_Forms_Config_Condition_No_FieldsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_No_FieldsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_no_fields(inputs)
	return es_intake_forms_config_condition_no_fields(inputs)
});