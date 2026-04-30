/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_QueueInputs */

const en_onboarding_step_queue = /** @type {(inputs: Onboarding_Step_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue`)
};

const es_onboarding_step_queue = /** @type {(inputs: Onboarding_Step_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cola`)
};

/**
* | output |
* | --- |
* | "Queue" |
*
* @param {Onboarding_Step_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_queue = /** @type {((inputs?: Onboarding_Step_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_step_queue(inputs)
	return es_onboarding_step_queue(inputs)
});