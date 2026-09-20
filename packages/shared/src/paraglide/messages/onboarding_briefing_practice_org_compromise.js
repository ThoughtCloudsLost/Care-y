/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Org_CompromiseInputs */

const en_onboarding_briefing_practice_org_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Org_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing usable. Still requires a volunteer's password to unlock.`)
};

const es_onboarding_briefing_practice_org_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Org_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nada utilizable. Aún requiere la contraseña de un voluntario para desbloquear.`)
};

const en_xa2_onboarding_briefing_practice_org_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Org_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng ùsàblè. Stìll rèqùìrès à vòlùntèèr's pàsswòrd tò ùnlòck. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Nothing usable. Still requires a volunteer's password to unlock." |
*
* @param {Onboarding_Briefing_Practice_Org_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_org_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Org_CompromiseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Org_CompromiseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_org_compromise(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_org_compromise(inputs)
	return en_onboarding_briefing_practice_org_compromise(inputs)
});