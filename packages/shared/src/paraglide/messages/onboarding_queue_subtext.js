/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_SubtextInputs */

const en_onboarding_queue_subtext = /** @type {(inputs: Onboarding_Queue_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queues organize incoming cases by topic or team.`)
};

const es_onboarding_queue_subtext = /** @type {(inputs: Onboarding_Queue_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las colas organizan los casos entrantes por tema o equipo.`)
};

/**
* | output |
* | --- |
* | "Queues organize incoming cases by topic or team." |
*
* @param {Onboarding_Queue_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_subtext = /** @type {((inputs?: Onboarding_Queue_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_subtext(inputs)
	return es_onboarding_queue_subtext(inputs)
});