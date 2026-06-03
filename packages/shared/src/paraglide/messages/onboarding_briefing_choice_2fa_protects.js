/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_2fa_ProtectsInputs */

const en_onboarding_briefing_choice_2fa_protects = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stolen passwords being used to access volunteer accounts.`)
};

const es_onboarding_briefing_choice_2fa_protects = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasenas robadas usadas para acceder a cuentas de voluntarios.`)
};

/**
* | output |
* | --- |
* | "Stolen passwords being used to access volunteer accounts." |
*
* @param {Onboarding_Briefing_Choice_2fa_ProtectsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_protects = /** @type {((inputs?: Onboarding_Briefing_Choice_2fa_ProtectsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_2fa_ProtectsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_2fa_protects(inputs)
	return es_onboarding_briefing_choice_2fa_protects(inputs)
});