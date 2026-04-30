/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Insider_TitleInputs */

const en_onboarding_briefing_scenario_insider_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Insider_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A volunteer goes rogue (insider threat)`)
};

const es_onboarding_briefing_scenario_insider_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Insider_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un voluntario actua maliciosamente (amenaza interna)`)
};

/**
* | output |
* | --- |
* | "A volunteer goes rogue (insider threat)" |
*
* @param {Onboarding_Briefing_Scenario_Insider_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_insider_title = /** @type {((inputs?: Onboarding_Briefing_Scenario_Insider_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Insider_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_insider_title(inputs)
	return es_onboarding_briefing_scenario_insider_title(inputs)
});