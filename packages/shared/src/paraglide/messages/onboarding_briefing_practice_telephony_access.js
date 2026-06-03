/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Telephony_AccessInputs */

const en_onboarding_briefing_practice_telephony_access = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server (automated calls/SMS)`)
};

const es_onboarding_briefing_practice_telephony_access = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor (llamadas/SMS automatizados)`)
};

/**
* | output |
* | --- |
* | "The server (automated calls/SMS)" |
*
* @param {Onboarding_Briefing_Practice_Telephony_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_telephony_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Telephony_AccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Telephony_AccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_telephony_access(inputs)
	return es_onboarding_briefing_practice_telephony_access(inputs)
});