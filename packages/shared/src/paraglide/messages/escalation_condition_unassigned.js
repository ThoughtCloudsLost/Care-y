/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Condition_UnassignedInputs */

const en_escalation_condition_unassigned = /** @type {(inputs: Escalation_Condition_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unassigned for`)
};

const es_escalation_condition_unassigned = /** @type {(inputs: Escalation_Condition_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin asignar por`)
};

/**
* | output |
* | --- |
* | "Unassigned for" |
*
* @param {Escalation_Condition_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_condition_unassigned = /** @type {((inputs?: Escalation_Condition_UnassignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Condition_UnassignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_condition_unassigned(inputs)
	return es_escalation_condition_unassigned(inputs)
});