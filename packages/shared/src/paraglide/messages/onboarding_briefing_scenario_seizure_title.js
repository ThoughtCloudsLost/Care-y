/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Seizure_TitleInputs */

const en_onboarding_briefing_scenario_seizure_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Seizure_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Someone seizes or breaks into the CARE-Y server`)
};

const es_onboarding_briefing_scenario_seizure_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Seizure_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alguien confisca o accede al servidor de CARE-Y`)
};

const en_xa2_onboarding_briefing_scenario_seizure_title = /** @type {(inputs: Onboarding_Briefing_Scenario_Seizure_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòmèònè sèìzès òr brèàks ìntò thè CÀRÈ-Y sèrvèr •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Someone seizes or breaks into the CARE-Y server" |
*
* @param {Onboarding_Briefing_Scenario_Seizure_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_seizure_title = /** @type {((inputs?: Onboarding_Briefing_Scenario_Seizure_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Seizure_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_scenario_seizure_title(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_scenario_seizure_title(inputs)
	return en_onboarding_briefing_scenario_seizure_title(inputs)
});