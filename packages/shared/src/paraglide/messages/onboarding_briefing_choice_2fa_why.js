/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_2fa_WhyInputs */

const en_onboarding_briefing_choice_2fa_why = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A password alone can be guessed, leaked, or stolen through a fake login page. Two-factor authentication adds a second check that makes stolen passwords useless on their own.`)
};

const es_onboarding_briefing_choice_2fa_why = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una contrasena sola puede ser adivinada, filtrada o robada a traves de una pagina de inicio de sesion falsa. La autenticacion de dos factores agrega una segunda verificacion que hace inutil una contrasena robada por si sola.`)
};

/**
* | output |
* | --- |
* | "A password alone can be guessed, leaked, or stolen through a fake login page. Two-factor authentication adds a second check that makes stolen passwords usele..." |
*
* @param {Onboarding_Briefing_Choice_2fa_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_why = /** @type {((inputs?: Onboarding_Briefing_Choice_2fa_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_2fa_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_2fa_why(inputs)
	return es_onboarding_briefing_choice_2fa_why(inputs)
});