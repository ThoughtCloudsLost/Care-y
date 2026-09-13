/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Max_LengthInputs */

const en_intake_forms_config_max_length = /** @type {(inputs: Intake_Forms_Config_Max_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Max length`)
};

const es_intake_forms_config_max_length = /** @type {(inputs: Intake_Forms_Config_Max_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Largo maximo`)
};

/**
* | output |
* | --- |
* | "Max length" |
*
* @param {Intake_Forms_Config_Max_LengthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_max_length = /** @type {((inputs?: Intake_Forms_Config_Max_LengthInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Max_LengthInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_max_length(inputs)
	return es_intake_forms_config_max_length(inputs)
});