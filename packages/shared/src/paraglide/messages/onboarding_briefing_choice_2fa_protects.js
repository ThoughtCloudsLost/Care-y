/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_2fa_ProtectsInputs */

const en_onboarding_briefing_choice_2fa_protects = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stolen passwords being used to access volunteer accounts.`)
};

const es_onboarding_briefing_choice_2fa_protects = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseñas robadas usadas para acceder a cuentas de voluntarios.`)
};

const en_xa2_onboarding_briefing_choice_2fa_protects = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stòlèn pàsswòrds bèìng ùsèd tò àccèss vòlùntèèr àccòùnts. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Stolen passwords being used to access volunteer accounts." |
*
* @param {Onboarding_Briefing_Choice_2fa_ProtectsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_protects = /** @type {((inputs?: Onboarding_Briefing_Choice_2fa_ProtectsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_2fa_ProtectsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_2fa_protects(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_2fa_protects(inputs)
	return en_onboarding_briefing_choice_2fa_protects(inputs)
});