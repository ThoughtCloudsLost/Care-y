/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Placeholder_Heading_QueueInputs */

const en_onboarding_placeholder_heading_queue = /** @type {(inputs: Onboarding_Placeholder_Heading_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Queue`)
};

const es_onboarding_placeholder_heading_queue = /** @type {(inputs: Onboarding_Placeholder_Heading_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear cola`)
};

/**
* | output |
* | --- |
* | "Create Queue" |
*
* @param {Onboarding_Placeholder_Heading_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_placeholder_heading_queue = /** @type {((inputs?: Onboarding_Placeholder_Heading_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Placeholder_Heading_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_placeholder_heading_queue(inputs)
	return es_onboarding_placeholder_heading_queue(inputs)
});