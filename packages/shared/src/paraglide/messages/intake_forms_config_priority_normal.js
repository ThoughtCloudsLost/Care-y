/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Priority_NormalInputs */

const en_intake_forms_config_priority_normal = /** @type {(inputs: Intake_Forms_Config_Priority_NormalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Normal`)
};

const es_intake_forms_config_priority_normal = /** @type {(inputs: Intake_Forms_Config_Priority_NormalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Normal`)
};

/**
* | output |
* | --- |
* | "Normal" |
*
* @param {Intake_Forms_Config_Priority_NormalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_priority_normal = /** @type {((inputs?: Intake_Forms_Config_Priority_NormalInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Priority_NormalInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_priority_normal(inputs)
	return es_intake_forms_config_priority_normal(inputs)
});