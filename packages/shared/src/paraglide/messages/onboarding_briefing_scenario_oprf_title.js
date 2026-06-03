/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Oprf_TitleInputs */

const en_onboarding_briefing_scenario_oprf_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Someone compromises one of the two verification servers`)
};

const es_onboarding_briefing_scenario_oprf_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alguien compromete uno de los dos servidores de verificacion`)
};

/**
* | output |
* | --- |
* | "Someone compromises one of the two verification servers" |
*
* @param {Onboarding_Briefing_Scenario_Oprf_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_oprf_title = /** @type {((inputs?: Onboarding_Briefing_Scenario_Oprf_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Oprf_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_oprf_title(inputs)
	return es_onboarding_briefing_scenario_oprf_title(inputs)
});