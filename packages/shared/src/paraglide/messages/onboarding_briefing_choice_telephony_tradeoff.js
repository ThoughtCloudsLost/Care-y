/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Telephony_TradeoffInputs */

const en_onboarding_briefing_choice_telephony_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Self-hosted gives you more control, but calls to regular phone numbers still pass through a carrier. The encrypted web chat in CARE-Y is always more private than any phone call.`)
};

const es_onboarding_briefing_choice_telephony_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auto-alojado te da más control, pero las llamadas a números regulares aún pasan por un operador. El chat cifrado de CARE-Y siempre es más privado que cualquier llamada telefonica.`)
};

const en_xa2_onboarding_briefing_choice_telephony_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlf-hòstèd gìvès yòù mòrè còntròl, bùt càlls tò règùlàr phònè nùmbèrs stìll pàss thròùgh à càrrìèr. Thè èncryptèd wèb chàt ìn CÀRÈ-Y ìs àlwàys mòrè prìvàtè thàn àny phònè càll. ••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Self-hosted gives you more control, but calls to regular phone numbers still pass through a carrier. The encrypted web chat in CARE-Y is always more private ..." |
*
* @param {Onboarding_Briefing_Choice_Telephony_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_telephony_tradeoff = /** @type {((inputs?: Onboarding_Briefing_Choice_Telephony_TradeoffInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Telephony_TradeoffInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_telephony_tradeoff(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_telephony_tradeoff(inputs)
	return en_onboarding_briefing_choice_telephony_tradeoff(inputs)
});