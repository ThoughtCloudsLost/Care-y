/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Label_ProtectsInputs */

const en_onboarding_briefing_choice_label_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Label_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What it protects against`)
};

const es_onboarding_briefing_choice_label_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Label_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contra que protege`)
};

/**
* | output |
* | --- |
* | "What it protects against" |
*
* @param {Onboarding_Briefing_Choice_Label_ProtectsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_label_protects = /** @type {((inputs?: Onboarding_Briefing_Choice_Label_ProtectsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Label_ProtectsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_label_protects(inputs)
	return es_onboarding_briefing_choice_label_protects(inputs)
});