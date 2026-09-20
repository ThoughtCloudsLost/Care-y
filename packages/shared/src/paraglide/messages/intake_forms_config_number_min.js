/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Number_MinInputs */

const en_intake_forms_config_number_min = /** @type {(inputs: Intake_Forms_Config_Number_MinInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Minimum value`)
};

const es_intake_forms_config_number_min = /** @type {(inputs: Intake_Forms_Config_Number_MinInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Valor mínimo`)
};

const en_xa2_intake_forms_config_number_min = /** @type {(inputs: Intake_Forms_Config_Number_MinInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mìnìmùm vàlùè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Minimum value" |
*
* @param {Intake_Forms_Config_Number_MinInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_number_min = /** @type {((inputs?: Intake_Forms_Config_Number_MinInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Number_MinInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_number_min(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_number_min(inputs)
	return en_intake_forms_config_number_min(inputs)
});