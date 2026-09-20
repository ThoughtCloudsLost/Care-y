/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_BriefingInputs */

const en_onboarding_step_briefing = /** @type {(inputs: Onboarding_Step_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Briefing`)
};

const es_onboarding_step_briefing = /** @type {(inputs: Onboarding_Step_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Información`)
};

const en_xa2_onboarding_step_briefing = /** @type {(inputs: Onboarding_Step_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Brìèfìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Briefing" |
*
* @param {Onboarding_Step_BriefingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_briefing = /** @type {((inputs?: Onboarding_Step_BriefingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_BriefingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_step_briefing(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_step_briefing(inputs)
	return en_onboarding_step_briefing(inputs)
});