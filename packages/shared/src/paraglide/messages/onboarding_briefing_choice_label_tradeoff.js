/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Label_TradeoffInputs */

const en_onboarding_briefing_choice_label_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Label_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pros and cons`)
};

const es_onboarding_briefing_choice_label_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Label_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ventajas y desventajas`)
};

const en_xa2_onboarding_briefing_choice_label_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Label_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pròs ànd còns ••••⟧`)
};

/**
* | output |
* | --- |
* | "Pros and cons" |
*
* @param {Onboarding_Briefing_Choice_Label_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_label_tradeoff = /** @type {((inputs?: Onboarding_Briefing_Choice_Label_TradeoffInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Label_TradeoffInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_label_tradeoff(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_label_tradeoff(inputs)
	return en_onboarding_briefing_choice_label_tradeoff(inputs)
});