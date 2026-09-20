/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Number_MaxInputs */

const en_intake_forms_config_number_max = /** @type {(inputs: Intake_Forms_Config_Number_MaxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Maximum value`)
};

const es_intake_forms_config_number_max = /** @type {(inputs: Intake_Forms_Config_Number_MaxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Valor máximo`)
};

const en_xa2_intake_forms_config_number_max = /** @type {(inputs: Intake_Forms_Config_Number_MaxInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Màxìmùm vàlùè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Maximum value" |
*
* @param {Intake_Forms_Config_Number_MaxInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_number_max = /** @type {((inputs?: Intake_Forms_Config_Number_MaxInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Number_MaxInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_number_max(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_number_max(inputs)
	return en_intake_forms_config_number_max(inputs)
});