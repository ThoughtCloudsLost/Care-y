/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Oprf_TitleInputs */

const en_onboarding_briefing_scenario_oprf_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Someone compromises one of the two verification servers`)
};

const es_onboarding_briefing_scenario_oprf_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alguien compromete uno de los dos servidores de verificación`)
};

const en_xa2_onboarding_briefing_scenario_oprf_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòmèònè còmpròmìsès ònè òf thè twò vèrìfìcàtìòn sèrvèrs •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Someone compromises one of the two verification servers" |
*
* @param {Onboarding_Briefing_Scenario_Oprf_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_oprf_title = /** @type {((inputs?: Onboarding_Briefing_Scenario_Oprf_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Oprf_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_scenario_oprf_title(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_scenario_oprf_title(inputs)
	return en_onboarding_briefing_scenario_oprf_title(inputs)
});