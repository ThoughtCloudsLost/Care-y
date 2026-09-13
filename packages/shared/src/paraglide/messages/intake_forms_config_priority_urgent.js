/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Priority_UrgentInputs */

const en_intake_forms_config_priority_urgent = /** @type {(inputs: Intake_Forms_Config_Priority_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgent`)
};

const es_intake_forms_config_priority_urgent = /** @type {(inputs: Intake_Forms_Config_Priority_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgente`)
};

/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Intake_Forms_Config_Priority_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_priority_urgent = /** @type {((inputs?: Intake_Forms_Config_Priority_UrgentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Priority_UrgentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_priority_urgent(inputs)
	return es_intake_forms_config_priority_urgent(inputs)
});