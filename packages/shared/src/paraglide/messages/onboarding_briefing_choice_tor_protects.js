/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Tor_ProtectsInputs */

const en_onboarding_briefing_choice_tor_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Someone finding out that your volunteers or clients are using this service.`)
};

const es_onboarding_briefing_choice_tor_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Que alguien descubra que tus voluntarios o clientes usan este servicio.`)
};

/**
* | output |
* | --- |
* | "Someone finding out that your volunteers or clients are using this service." |
*
* @param {Onboarding_Briefing_Choice_Tor_ProtectsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_tor_protects = /** @type {((inputs?: Onboarding_Briefing_Choice_Tor_ProtectsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Tor_ProtectsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_tor_protects(inputs)
	return es_onboarding_briefing_choice_tor_protects(inputs)
});