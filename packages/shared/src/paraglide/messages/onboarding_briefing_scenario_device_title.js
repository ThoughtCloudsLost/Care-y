/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Device_TitleInputs */

const en_onboarding_briefing_scenario_device_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Device_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A volunteer's device is compromised`)
};

const es_onboarding_briefing_scenario_device_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Device_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El dispositivo de un voluntario es comprometido`)
};

/**
* | output |
* | --- |
* | "A volunteer's device is compromised" |
*
* @param {Onboarding_Briefing_Scenario_Device_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_device_title = /** @type {((inputs?: Onboarding_Briefing_Scenario_Device_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Device_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_device_title(inputs)
	return es_onboarding_briefing_scenario_device_title(inputs)
});