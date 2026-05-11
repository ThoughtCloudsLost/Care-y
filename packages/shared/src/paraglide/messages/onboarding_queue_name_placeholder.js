/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_Name_PlaceholderInputs */

const en_onboarding_queue_name_placeholder = /** @type {(inputs: Onboarding_Queue_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`General Intake`)
};

const es_onboarding_queue_name_placeholder = /** @type {(inputs: Onboarding_Queue_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admision general`)
};

/**
* | output |
* | --- |
* | "General Intake" |
*
* @param {Onboarding_Queue_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_name_placeholder = /** @type {((inputs?: Onboarding_Queue_Name_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_Name_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_name_placeholder(inputs)
	return es_onboarding_queue_name_placeholder(inputs)
});