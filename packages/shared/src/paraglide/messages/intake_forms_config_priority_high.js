/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Priority_HighInputs */

const en_intake_forms_config_priority_high = /** @type {(inputs: Intake_Forms_Config_Priority_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High`)
};

const es_intake_forms_config_priority_high = /** @type {(inputs: Intake_Forms_Config_Priority_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alta`)
};

/**
* | output |
* | --- |
* | "High" |
*
* @param {Intake_Forms_Config_Priority_HighInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_priority_high = /** @type {((inputs?: Intake_Forms_Config_Priority_HighInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Priority_HighInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_priority_high(inputs)
	return es_intake_forms_config_priority_high(inputs)
});