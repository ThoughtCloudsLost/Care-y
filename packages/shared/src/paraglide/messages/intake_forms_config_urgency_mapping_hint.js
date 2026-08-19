/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Urgency_Mapping_HintInputs */

const en_intake_forms_config_urgency_mapping_hint = /** @type {(inputs: Intake_Forms_Config_Urgency_Mapping_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a priority level for each option.`)
};

const es_intake_forms_config_urgency_mapping_hint = /** @type {(inputs: Intake_Forms_Config_Urgency_Mapping_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elija un nivel de prioridad para cada opcion.`)
};

/**
* | output |
* | --- |
* | "Choose a priority level for each option." |
*
* @param {Intake_Forms_Config_Urgency_Mapping_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_urgency_mapping_hint = /** @type {((inputs?: Intake_Forms_Config_Urgency_Mapping_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Urgency_Mapping_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_urgency_mapping_hint(inputs)
	return es_intake_forms_config_urgency_mapping_hint(inputs)
});