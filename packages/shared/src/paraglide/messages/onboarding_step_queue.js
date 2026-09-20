/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Onboarding_Step_QueueInputs */

const en_onboarding_step_queue = /** @type {(inputs: Onboarding_Step_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const es_onboarding_step_queue = /** @type {(inputs: Onboarding_Step_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const en_xa2_onboarding_step_queue = /** @type {(inputs: Onboarding_Step_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Onboarding_Step_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_queue = /** @type {((inputs: Onboarding_Step_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_step_queue(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_step_queue(inputs)
	return en_onboarding_step_queue(inputs)
});