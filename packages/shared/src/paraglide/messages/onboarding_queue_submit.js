/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Onboarding_Queue_SubmitInputs */

const en_onboarding_queue_submit = /** @type {(inputs: Onboarding_Queue_SubmitInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create ${i?.Queue}`)
};

const es_onboarding_queue_submit = /** @type {(inputs: Onboarding_Queue_SubmitInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crear ${i?.queue}`)
};

/**
* | output |
* | --- |
* | "Create {Queue}" |
*
* @param {Onboarding_Queue_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_submit = /** @type {((inputs: Onboarding_Queue_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_submit(inputs)
	return es_onboarding_queue_submit(inputs)
});