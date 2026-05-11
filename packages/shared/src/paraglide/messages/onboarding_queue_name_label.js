/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_Name_LabelInputs */

const en_onboarding_queue_name_label = /** @type {(inputs: Onboarding_Queue_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue Name`)
};

const es_onboarding_queue_name_label = /** @type {(inputs: Onboarding_Queue_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de la cola`)
};

/**
* | output |
* | --- |
* | "Queue Name" |
*
* @param {Onboarding_Queue_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_name_label = /** @type {((inputs?: Onboarding_Queue_Name_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_Name_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_name_label(inputs)
	return es_onboarding_queue_name_label(inputs)
});