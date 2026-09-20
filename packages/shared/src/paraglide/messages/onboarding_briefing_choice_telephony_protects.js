/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Telephony_ProtectsInputs */

const en_onboarding_briefing_choice_telephony_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone calls and text messages being recorded or listened to by a third party.`)
};

const es_onboarding_briefing_choice_telephony_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamadas telefonicas y mensajes de texto que sean grabados o escuchados por terceros.`)
};

const en_xa2_onboarding_briefing_choice_telephony_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè càlls ànd tèxt mèssàgès bèìng rècòrdèd òr lìstènèd tò by à thìrd pàrty. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone calls and text messages being recorded or listened to by a third party." |
*
* @param {Onboarding_Briefing_Choice_Telephony_ProtectsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_telephony_protects = /** @type {((inputs?: Onboarding_Briefing_Choice_Telephony_ProtectsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Telephony_ProtectsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_telephony_protects(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_telephony_protects(inputs)
	return en_onboarding_briefing_choice_telephony_protects(inputs)
});