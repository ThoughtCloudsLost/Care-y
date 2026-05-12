/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Label_WhyInputs */

const en_onboarding_briefing_choice_label_why = /** @type {(inputs: Onboarding_Briefing_Choice_Label_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Why you should care`)
};

const es_onboarding_briefing_choice_label_why = /** @type {(inputs: Onboarding_Briefing_Choice_Label_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por que deberia importarte`)
};

/**
* | output |
* | --- |
* | "Why you should care" |
*
* @param {Onboarding_Briefing_Choice_Label_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_label_why = /** @type {((inputs?: Onboarding_Briefing_Choice_Label_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Label_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_label_why(inputs)
	return es_onboarding_briefing_choice_label_why(inputs)
});