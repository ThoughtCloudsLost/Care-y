/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_BriefingInputs */

const en_onboarding_step_briefing = /** @type {(inputs: Onboarding_Step_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Briefing`)
};

const es_onboarding_step_briefing = /** @type {(inputs: Onboarding_Step_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Informacion`)
};

/**
* | output |
* | --- |
* | "Briefing" |
*
* @param {Onboarding_Step_BriefingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_briefing = /** @type {((inputs?: Onboarding_Step_BriefingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_BriefingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_step_briefing(inputs)
	return es_onboarding_step_briefing(inputs)
});