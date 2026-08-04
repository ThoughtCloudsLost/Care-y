/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Condition_InactiveInputs */

const en_escalation_condition_inactive = /** @type {(inputs: Escalation_Condition_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No activity for`)
};

const es_escalation_condition_inactive = /** @type {(inputs: Escalation_Condition_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin actividad por`)
};

/**
* | output |
* | --- |
* | "No activity for" |
*
* @param {Escalation_Condition_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_condition_inactive = /** @type {((inputs?: Escalation_Condition_InactiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Condition_InactiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_condition_inactive(inputs)
	return es_escalation_condition_inactive(inputs)
});