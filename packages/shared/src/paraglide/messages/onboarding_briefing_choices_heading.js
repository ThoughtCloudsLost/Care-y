/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choices_HeadingInputs */

const en_onboarding_briefing_choices_heading = /** @type {(inputs: Onboarding_Briefing_Choices_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your Setup Choices and Their Security Impact`)
};

const es_onboarding_briefing_choices_heading = /** @type {(inputs: Onboarding_Briefing_Choices_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus decisiones de configuracion y su impacto en la seguridad`)
};

/**
* | output |
* | --- |
* | "Your Setup Choices and Their Security Impact" |
*
* @param {Onboarding_Briefing_Choices_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choices_heading = /** @type {((inputs?: Onboarding_Briefing_Choices_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choices_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choices_heading(inputs)
	return es_onboarding_briefing_choices_heading(inputs)
});