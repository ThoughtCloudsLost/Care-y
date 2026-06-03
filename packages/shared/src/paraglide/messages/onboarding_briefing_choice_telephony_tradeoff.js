/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Telephony_TradeoffInputs */

const en_onboarding_briefing_choice_telephony_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Self-hosted gives you more control, but calls to regular phone numbers still pass through a carrier. The encrypted web chat in CARE-Y is always more private than any phone call.`)
};

const es_onboarding_briefing_choice_telephony_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auto-alojado te da mas control, pero las llamadas a numeros regulares aun pasan por un operador. El chat cifrado de CARE-Y siempre es mas privado que cualquier llamada telefonica.`)
};

/**
* | output |
* | --- |
* | "Self-hosted gives you more control, but calls to regular phone numbers still pass through a carrier. The encrypted web chat in CARE-Y is always more private ..." |
*
* @param {Onboarding_Briefing_Choice_Telephony_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_telephony_tradeoff = /** @type {((inputs?: Onboarding_Briefing_Choice_Telephony_TradeoffInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Telephony_TradeoffInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_telephony_tradeoff(inputs)
	return es_onboarding_briefing_choice_telephony_tradeoff(inputs)
});