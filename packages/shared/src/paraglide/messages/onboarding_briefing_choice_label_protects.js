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

const en_xa2_onboarding_briefing_choice_label_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Label_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt ìt pròtècts àgàìnst ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "What it protects against" |
*
* @param {Onboarding_Briefing_Choice_Label_ProtectsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_label_protects = /** @type {((inputs?: Onboarding_Briefing_Choice_Label_ProtectsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Label_ProtectsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_label_protects(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_label_protects(inputs)
	return en_onboarding_briefing_choice_label_protects(inputs)
});