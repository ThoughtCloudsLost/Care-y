/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenarios_HeadingInputs */

const en_onboarding_briefing_scenarios_heading = /** @type {(inputs: Onboarding_Briefing_Scenarios_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Compromise Scenarios`)
};

const es_onboarding_briefing_scenarios_heading = /** @type {(inputs: Onboarding_Briefing_Scenarios_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escenarios de compromiso`)
};

/**
* | output |
* | --- |
* | "Compromise Scenarios" |
*
* @param {Onboarding_Briefing_Scenarios_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenarios_heading = /** @type {((inputs?: Onboarding_Briefing_Scenarios_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenarios_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenarios_heading(inputs)
	return es_onboarding_briefing_scenarios_heading(inputs)
});