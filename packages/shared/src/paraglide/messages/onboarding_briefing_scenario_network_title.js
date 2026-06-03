/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Network_TitleInputs */

const en_onboarding_briefing_scenario_network_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Network surveillance (ISP monitoring, traffic analysis)`)
};

const es_onboarding_briefing_scenario_network_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vigilancia de red (monitoreo de ISP, analisis de trafico)`)
};

/**
* | output |
* | --- |
* | "Network surveillance (ISP monitoring, traffic analysis)" |
*
* @param {Onboarding_Briefing_Scenario_Network_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_network_title = /** @type {((inputs?: Onboarding_Briefing_Scenario_Network_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Network_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_network_title(inputs)
	return es_onboarding_briefing_scenario_network_title(inputs)
});