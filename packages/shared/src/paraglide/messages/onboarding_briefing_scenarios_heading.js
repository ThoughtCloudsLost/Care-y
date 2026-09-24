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

const en_xa2_onboarding_briefing_scenarios_heading = /** @type {(inputs: Onboarding_Briefing_Scenarios_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmpròmìsè Scènàrìòs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Compromise Scenarios" |
*
* @param {Onboarding_Briefing_Scenarios_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenarios_heading = /** @type {((inputs?: Onboarding_Briefing_Scenarios_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenarios_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_scenarios_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_scenarios_heading(inputs)
	return en_onboarding_briefing_scenarios_heading(inputs)
});