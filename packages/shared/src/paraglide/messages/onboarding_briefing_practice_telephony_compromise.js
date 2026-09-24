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

const en_xa2_onboarding_briefing_practice_telephony_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè systèm ÀPÌ àccèss ònly. Ròtàtè crèdèntìàls ìmmèdìàtèly ìf còmpròmìsèd. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone system API access only. Rotate credentials immediately if compromised." |
*
* @param {Onboarding_Briefing_Practice_Telephony_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_telephony_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Telephony_CompromiseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Telephony_CompromiseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_telephony_compromise(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_telephony_compromise(inputs)
	return en_onboarding_briefing_practice_telephony_compromise(inputs)
});