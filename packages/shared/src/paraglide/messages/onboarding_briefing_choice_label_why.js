/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Label_WhyInputs */

const en_onboarding_briefing_choice_label_why = /** @type {(inputs: Onboarding_Briefing_Choice_Label_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Why you should care`)
};

const es_onboarding_briefing_choice_label_why = /** @type {(inputs: Onboarding_Briefing_Choice_Label_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por qué deberia importarte`)
};

const en_xa2_onboarding_briefing_choice_label_why = /** @type {(inputs: Onboarding_Briefing_Choice_Label_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Why yòù shòùld càrè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Why you should care" |
*
* @param {Onboarding_Briefing_Choice_Label_WhyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_label_why = /** @type {((inputs?: Onboarding_Briefing_Choice_Label_WhyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Label_WhyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_label_why(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_label_why(inputs)
	return en_onboarding_briefing_choice_label_why(inputs)
});