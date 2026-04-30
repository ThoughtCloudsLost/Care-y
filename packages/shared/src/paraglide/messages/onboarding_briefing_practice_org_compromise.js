/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Org_CompromiseInputs */

const en_onboarding_briefing_practice_org_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Org_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing usable. Still requires a volunteer's password to unlock.`)
};

const es_onboarding_briefing_practice_org_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Org_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nada utilizable. Aun requiere la contrasena de un voluntario para desbloquear.`)
};

/**
* | output |
* | --- |
* | "Nothing usable. Still requires a volunteer's password to unlock." |
*
* @param {Onboarding_Briefing_Practice_Org_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_org_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Org_CompromiseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Org_CompromiseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_org_compromise(inputs)
	return es_onboarding_briefing_practice_org_compromise(inputs)
});