/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Vol_CompromiseInputs */

const en_onboarding_briefing_practice_vol_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Vol_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing usable. Encrypted with your org's key.`)
};

const es_onboarding_briefing_practice_vol_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Vol_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nada utilizable. Cifrado con la clave de tu organización.`)
};

const en_xa2_onboarding_briefing_practice_vol_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Vol_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng ùsàblè. Èncryptèd wìth yòùr òrg's kèy. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Nothing usable. Encrypted with your org's key." |
*
* @param {Onboarding_Briefing_Practice_Vol_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_vol_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Vol_CompromiseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Vol_CompromiseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_vol_compromise(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_vol_compromise(inputs)
	return en_onboarding_briefing_practice_vol_compromise(inputs)
});