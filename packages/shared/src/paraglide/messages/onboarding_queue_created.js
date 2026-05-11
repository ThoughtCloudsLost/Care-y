/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_CreatedInputs */

const en_onboarding_queue_created = /** @type {(inputs: Onboarding_Queue_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue created.`)
};

const es_onboarding_queue_created = /** @type {(inputs: Onboarding_Queue_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cola creada.`)
};

/**
* | output |
* | --- |
* | "Queue created." |
*
* @param {Onboarding_Queue_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_created = /** @type {((inputs?: Onboarding_Queue_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_created(inputs)
	return es_onboarding_queue_created(inputs)
});