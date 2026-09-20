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

const en_xa2_escalation_condition_unassigned = /** @type {(inputs: Escalation_Condition_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnàssìgnèd fòr •••••⟧`)
};

/**
* | output |
* | --- |
* | "Unassigned for" |
*
* @param {Escalation_Condition_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_condition_unassigned = /** @type {((inputs?: Escalation_Condition_UnassignedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Condition_UnassignedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_condition_unassigned(inputs)
	if (locale === "en-XA") return en_xa2_escalation_condition_unassigned(inputs)
	return en_escalation_condition_unassigned(inputs)
});