/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Escalation_Mapping_TitleInputs */

const en_intake_forms_config_escalation_mapping_title = /** @type {(inputs: Intake_Forms_Config_Escalation_Mapping_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation mapping`)
};

const es_intake_forms_config_escalation_mapping_title = /** @type {(inputs: Intake_Forms_Config_Escalation_Mapping_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mapeo de escalamiento`)
};

const en_xa2_intake_forms_config_escalation_mapping_title = /** @type {(inputs: Intake_Forms_Config_Escalation_Mapping_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èscàlàtìòn màppìng ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Escalation mapping" |
*
* @param {Intake_Forms_Config_Escalation_Mapping_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_escalation_mapping_title = /** @type {((inputs?: Intake_Forms_Config_Escalation_Mapping_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Escalation_Mapping_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_escalation_mapping_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_escalation_mapping_title(inputs)
	return en_intake_forms_config_escalation_mapping_title(inputs)
});