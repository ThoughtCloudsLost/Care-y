/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Urgency_Mapping_HintInputs */

const en_intake_forms_config_urgency_mapping_hint = /** @type {(inputs: Intake_Forms_Config_Urgency_Mapping_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a priority level for each option.`)
};

const es_intake_forms_config_urgency_mapping_hint = /** @type {(inputs: Intake_Forms_Config_Urgency_Mapping_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elija un nivel de prioridad para cada opción.`)
};

const en_xa2_intake_forms_config_urgency_mapping_hint = /** @type {(inputs: Intake_Forms_Config_Urgency_Mapping_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chòòsè à prìòrìty lèvèl fòr èàch òptìòn. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choose a priority level for each option." |
*
* @param {Intake_Forms_Config_Urgency_Mapping_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_urgency_mapping_hint = /** @type {((inputs?: Intake_Forms_Config_Urgency_Mapping_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Urgency_Mapping_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_urgency_mapping_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_urgency_mapping_hint(inputs)
	return en_intake_forms_config_urgency_mapping_hint(inputs)
});