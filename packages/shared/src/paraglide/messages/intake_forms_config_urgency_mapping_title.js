/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Urgency_Mapping_TitleInputs */

const en_intake_forms_config_urgency_mapping_title = /** @type {(inputs: Intake_Forms_Config_Urgency_Mapping_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority mapping`)
};

const es_intake_forms_config_urgency_mapping_title = /** @type {(inputs: Intake_Forms_Config_Urgency_Mapping_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mapeo de prioridad`)
};

/**
* | output |
* | --- |
* | "Priority mapping" |
*
* @param {Intake_Forms_Config_Urgency_Mapping_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_urgency_mapping_title = /** @type {((inputs?: Intake_Forms_Config_Urgency_Mapping_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Urgency_Mapping_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_urgency_mapping_title(inputs)
	return es_intake_forms_config_urgency_mapping_title(inputs)
});