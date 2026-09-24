/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Onboarding_Queue_CreatedInputs */

const en_onboarding_queue_created = /** @type {(inputs: Onboarding_Queue_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} created.`)
};

const es_onboarding_queue_created = /** @type {(inputs: Onboarding_Queue_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} creada.`)
};

const en_xa2_onboarding_queue_created = /** @type {(inputs: Onboarding_Queue_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} crèàtèd. •••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} created." |
*
* @param {Onboarding_Queue_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_created = /** @type {((inputs: Onboarding_Queue_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_queue_created(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_queue_created(inputs)
	return en_onboarding_queue_created(inputs)
});