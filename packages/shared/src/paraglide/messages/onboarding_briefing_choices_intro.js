/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choices_IntroInputs */

const en_onboarding_briefing_choices_intro = /** @type {(inputs: Onboarding_Briefing_Choices_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The decisions you make during setup affect the security of every volunteer and client in your org.`)
};

const es_onboarding_briefing_choices_intro = /** @type {(inputs: Onboarding_Briefing_Choices_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las decisiones que tomes durante la configuracion afectan la seguridad de cada voluntario y cliente en tu organizacion.`)
};

/**
* | output |
* | --- |
* | "The decisions you make during setup affect the security of every volunteer and client in your org." |
*
* @param {Onboarding_Briefing_Choices_IntroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choices_intro = /** @type {((inputs?: Onboarding_Briefing_Choices_IntroInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choices_IntroInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choices_intro(inputs)
	return es_onboarding_briefing_choices_intro(inputs)
});