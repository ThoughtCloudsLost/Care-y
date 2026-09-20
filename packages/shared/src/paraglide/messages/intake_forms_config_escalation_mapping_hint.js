/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Escalation_Mapping_HintInputs */

const en_intake_forms_config_escalation_mapping_hint = /** @type {(inputs: Intake_Forms_Config_Escalation_Mapping_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set an alert level for each option.`)
};

const es_intake_forms_config_escalation_mapping_hint = /** @type {(inputs: Intake_Forms_Config_Escalation_Mapping_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Establezca un nivel de alerta para cada opción.`)
};

const en_xa2_intake_forms_config_escalation_mapping_hint = /** @type {(inputs: Intake_Forms_Config_Escalation_Mapping_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt àn àlèrt lèvèl fòr èàch òptìòn. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set an alert level for each option." |
*
* @param {Intake_Forms_Config_Escalation_Mapping_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_escalation_mapping_hint = /** @type {((inputs?: Intake_Forms_Config_Escalation_Mapping_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Escalation_Mapping_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_escalation_mapping_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_escalation_mapping_hint(inputs)
	return en_intake_forms_config_escalation_mapping_hint(inputs)
});