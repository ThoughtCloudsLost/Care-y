/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_ErrorInputs */

const en_onboarding_queue_error = /** @type {(inputs: Onboarding_Queue_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to create queue.`)
};

const es_onboarding_queue_error = /** @type {(inputs: Onboarding_Queue_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo crear la cola.`)
};

/**
* | output |
* | --- |
* | "Failed to create queue." |
*
* @param {Onboarding_Queue_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_error = /** @type {((inputs?: Onboarding_Queue_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_error(inputs)
	return es_onboarding_queue_error(inputs)
});