/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Vol_AccessInputs */

const en_onboarding_briefing_practice_vol_access = /** @type {(inputs: Onboarding_Briefing_Practice_Vol_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only logged-in volunteers in your org (encrypted)`)
};

const es_onboarding_briefing_practice_vol_access = /** @type {(inputs: Onboarding_Briefing_Practice_Vol_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo voluntarios autenticados en tu organizacion (cifrado)`)
};

/**
* | output |
* | --- |
* | "Only logged-in volunteers in your org (encrypted)" |
*
* @param {Onboarding_Briefing_Practice_Vol_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_vol_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Vol_AccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Vol_AccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_vol_access(inputs)
	return es_onboarding_briefing_practice_vol_access(inputs)
});