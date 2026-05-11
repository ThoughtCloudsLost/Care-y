/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_Escalation_LabelInputs */

const en_onboarding_queue_escalation_label = /** @type {(inputs: Onboarding_Queue_Escalation_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation Days`)
};

const es_onboarding_queue_escalation_label = /** @type {(inputs: Onboarding_Queue_Escalation_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dias de escalamiento`)
};

/**
* | output |
* | --- |
* | "Escalation Days" |
*
* @param {Onboarding_Queue_Escalation_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_escalation_label = /** @type {((inputs?: Onboarding_Queue_Escalation_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_Escalation_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_escalation_label(inputs)
	return es_onboarding_queue_escalation_label(inputs)
});