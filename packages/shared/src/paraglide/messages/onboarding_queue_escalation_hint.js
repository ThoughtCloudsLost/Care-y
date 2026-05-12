/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Onboarding_Queue_Escalation_HintInputs */

const en_onboarding_queue_escalation_hint = /** @type {(inputs: Onboarding_Queue_Escalation_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Days before an unresolved ${i?.ticket} is flagged. 1 to 365.`)
};

const es_onboarding_queue_escalation_hint = /** @type {(inputs: Onboarding_Queue_Escalation_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Dias antes de que un ${i?.ticket} sin resolver sea marcado. 1 a 365.`)
};

/**
* | output |
* | --- |
* | "Days before an unresolved {ticket} is flagged. 1 to 365." |
*
* @param {Onboarding_Queue_Escalation_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_escalation_hint = /** @type {((inputs: Onboarding_Queue_Escalation_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_Escalation_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_escalation_hint(inputs)
	return es_onboarding_queue_escalation_hint(inputs)
});