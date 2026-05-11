/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_Error_Escalation_RangeInputs */

const en_onboarding_queue_error_escalation_range = /** @type {(inputs: Onboarding_Queue_Error_Escalation_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation days must be between 1 and 365.`)
};

const es_onboarding_queue_error_escalation_range = /** @type {(inputs: Onboarding_Queue_Error_Escalation_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los dias de escalamiento deben estar entre 1 y 365.`)
};

/**
* | output |
* | --- |
* | "Escalation days must be between 1 and 365." |
*
* @param {Onboarding_Queue_Error_Escalation_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_error_escalation_range = /** @type {((inputs?: Onboarding_Queue_Error_Escalation_RangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_Error_Escalation_RangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_error_escalation_range(inputs)
	return es_onboarding_queue_error_escalation_range(inputs)
});