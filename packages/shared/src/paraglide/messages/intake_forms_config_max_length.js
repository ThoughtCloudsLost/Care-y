/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Max_LengthInputs */

const en_intake_forms_config_max_length = /** @type {(inputs: Intake_Forms_Config_Max_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Max length`)
};

const es_intake_forms_config_max_length = /** @type {(inputs: Intake_Forms_Config_Max_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Largo máximo`)
};

const en_xa2_intake_forms_config_max_length = /** @type {(inputs: Intake_Forms_Config_Max_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Màx lèngth •••⟧`)
};

/**
* | output |
* | --- |
* | "Max length" |
*
* @param {Intake_Forms_Config_Max_LengthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_max_length = /** @type {((inputs?: Intake_Forms_Config_Max_LengthInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Max_LengthInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_max_length(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_max_length(inputs)
	return en_intake_forms_config_max_length(inputs)
});