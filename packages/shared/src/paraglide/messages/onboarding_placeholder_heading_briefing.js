/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Placeholder_Heading_BriefingInputs */

const en_onboarding_placeholder_heading_briefing = /** @type {(inputs: Onboarding_Placeholder_Heading_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Security Briefing`)
};

const es_onboarding_placeholder_heading_briefing = /** @type {(inputs: Onboarding_Placeholder_Heading_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Informacion de seguridad`)
};

/**
* | output |
* | --- |
* | "Security Briefing" |
*
* @param {Onboarding_Placeholder_Heading_BriefingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_placeholder_heading_briefing = /** @type {((inputs?: Onboarding_Placeholder_Heading_BriefingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Placeholder_Heading_BriefingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_placeholder_heading_briefing(inputs)
	return es_onboarding_placeholder_heading_briefing(inputs)
});