/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Telephony_WhyInputs */

const en_onboarding_briefing_choice_telephony_why = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If someone gains access to your phone provider's records, they could see who called whom, when, and for how long. A managed provider holds these records. A self-hosted setup keeps them on your own servers instead.`)
};

const es_onboarding_briefing_choice_telephony_why = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si alguien accede a los registros de tu proveedor telefónico, podría ver quién llamó a quién, cuándo y por cuánto tiempo. Un proveedor gestionado guarda estos registros. Una configuración auto-alojada los mantiene en tus propios servidores.`)
};

const en_xa2_onboarding_briefing_choice_telephony_why = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìf sòmèònè gàìns àccèss tò yòùr phònè pròvìdèr's rècòrds, thèy còùld sèè whò càllèd whòm, whèn, ànd fòr hòw lòng. À mànàgèd pròvìdèr hòlds thèsè rècòrds. À sèlf-hòstèd sètùp kèèps thèm òn yòùr òwn sèrvèrs ìnstèàd. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "If someone gains access to your phone provider's records, they could see who called whom, when, and for how long. A managed provider holds these records. A s..." |
*
* @param {Onboarding_Briefing_Choice_Telephony_WhyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_telephony_why = /** @type {((inputs?: Onboarding_Briefing_Choice_Telephony_WhyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Telephony_WhyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_telephony_why(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_telephony_why(inputs)
	return en_onboarding_briefing_choice_telephony_why(inputs)
});