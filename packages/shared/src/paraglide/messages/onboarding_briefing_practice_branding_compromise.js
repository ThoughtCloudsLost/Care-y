/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Branding_CompromiseInputs */

const en_onboarding_briefing_practice_branding_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Visual identity only. This is intentionally readable so clients recognize your org.`)
};

const es_onboarding_briefing_practice_branding_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo identidad visual. Es intencionalmente legible para que los clientes reconozcan tu organizacion.`)
};

/**
* | output |
* | --- |
* | "Visual identity only. This is intentionally readable so clients recognize your org." |
*
* @param {Onboarding_Briefing_Practice_Branding_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_branding_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Branding_CompromiseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Branding_CompromiseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_branding_compromise(inputs)
	return es_onboarding_briefing_practice_branding_compromise(inputs)
});