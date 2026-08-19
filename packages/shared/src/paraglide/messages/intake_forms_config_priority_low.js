/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Priority_LowInputs */

const en_intake_forms_config_priority_low = /** @type {(inputs: Intake_Forms_Config_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Low`)
};

const es_intake_forms_config_priority_low = /** @type {(inputs: Intake_Forms_Config_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Baja`)
};

/**
* | output |
* | --- |
* | "Low" |
*
* @param {Intake_Forms_Config_Priority_LowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_priority_low = /** @type {((inputs?: Intake_Forms_Config_Priority_LowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Priority_LowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_priority_low(inputs)
	return es_intake_forms_config_priority_low(inputs)
});