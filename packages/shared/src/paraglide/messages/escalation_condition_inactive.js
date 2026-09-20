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

const en_xa2_escalation_condition_inactive = /** @type {(inputs: Escalation_Condition_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò àctìvìty fòr •••••⟧`)
};

/**
* | output |
* | --- |
* | "No activity for" |
*
* @param {Escalation_Condition_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_condition_inactive = /** @type {((inputs?: Escalation_Condition_InactiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Condition_InactiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_condition_inactive(inputs)
	if (locale === "en-XA") return en_xa2_escalation_condition_inactive(inputs)
	return en_escalation_condition_inactive(inputs)
});