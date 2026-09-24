/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choices_HeadingInputs */

const en_onboarding_briefing_choices_heading = /** @type {(inputs: Onboarding_Briefing_Choices_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your Setup Choices and Their Security Impact`)
};

const es_onboarding_briefing_choices_heading = /** @type {(inputs: Onboarding_Briefing_Choices_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus decisiones de configuración y su impacto en la seguridad`)
};

const en_xa2_onboarding_briefing_choices_heading = /** @type {(inputs: Onboarding_Briefing_Choices_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr Sètùp Chòìcès ànd Thèìr Sècùrìty Ìmpàct ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your Setup Choices and Their Security Impact" |
*
* @param {Onboarding_Briefing_Choices_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choices_heading = /** @type {((inputs?: Onboarding_Briefing_Choices_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choices_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choices_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choices_heading(inputs)
	return en_onboarding_briefing_choices_heading(inputs)
});