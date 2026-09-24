/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choices_IntroInputs */

const en_onboarding_briefing_choices_intro = /** @type {(inputs: Onboarding_Briefing_Choices_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The decisions you make during setup affect the security of every volunteer and client in your org.`)
};

const es_onboarding_briefing_choices_intro = /** @type {(inputs: Onboarding_Briefing_Choices_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las decisiones que tomes durante la configuración afectan la seguridad de cada voluntario y cliente en tu organización.`)
};

const en_xa2_onboarding_briefing_choices_intro = /** @type {(inputs: Onboarding_Briefing_Choices_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dècìsìòns yòù màkè dùrìng sètùp àffèct thè sècùrìty òf èvèry vòlùntèèr ànd clìènt ìn yòùr òrg. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The decisions you make during setup affect the security of every volunteer and client in your org." |
*
* @param {Onboarding_Briefing_Choices_IntroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choices_intro = /** @type {((inputs?: Onboarding_Briefing_Choices_IntroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choices_IntroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choices_intro(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choices_intro(inputs)
	return en_onboarding_briefing_choices_intro(inputs)
});