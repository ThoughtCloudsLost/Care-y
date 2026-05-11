/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_HeadingInputs */

const en_onboarding_queue_heading = /** @type {(inputs: Onboarding_Queue_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Your First Queue`)
};

const es_onboarding_queue_heading = /** @type {(inputs: Onboarding_Queue_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cree su primera cola`)
};

/**
* | output |
* | --- |
* | "Create Your First Queue" |
*
* @param {Onboarding_Queue_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_heading = /** @type {((inputs?: Onboarding_Queue_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_heading(inputs)
	return es_onboarding_queue_heading(inputs)
});