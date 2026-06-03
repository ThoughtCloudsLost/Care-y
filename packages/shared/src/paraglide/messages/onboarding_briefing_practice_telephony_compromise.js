/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Telephony_CompromiseInputs */

const en_onboarding_briefing_practice_telephony_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone system API access only. Rotate credentials immediately if compromised.`)
};

const es_onboarding_briefing_practice_telephony_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo acceso a la API telefonica. Rota las credenciales inmediatamente si se comprometen.`)
};

/**
* | output |
* | --- |
* | "Phone system API access only. Rotate credentials immediately if compromised." |
*
* @param {Onboarding_Briefing_Practice_Telephony_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_telephony_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Telephony_CompromiseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Telephony_CompromiseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_telephony_compromise(inputs)
	return es_onboarding_briefing_practice_telephony_compromise(inputs)
});