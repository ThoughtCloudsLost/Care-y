/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_2fa_WhyInputs */

const en_onboarding_briefing_choice_2fa_why = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A password alone can be guessed, leaked, or stolen through a fake login page. Two factor authentication adds a second check that makes stolen passwords useless on their own.`)
};

const es_onboarding_briefing_choice_2fa_why = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una contraseña sola puede ser adivinada, filtrada o robada a traves de una página de inicio de sesión falsa. La autenticación de dos factores agrega una segunda verificación que hace inútil una contraseña robada por sí sola.`)
};

const en_xa2_onboarding_briefing_choice_2fa_why = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À pàsswòrd àlònè càn bè gùèssèd, lèàkèd, òr stòlèn thròùgh à fàkè lògìn pàgè. Twò fàctòr àùthèntìcàtìòn àdds à sècònd chèck thàt màkès stòlèn pàsswòrds ùsèlèss òn thèìr òwn. ••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A password alone can be guessed, leaked, or stolen through a fake login page. Two factor authentication adds a second check that makes stolen passwords usele..." |
*
* @param {Onboarding_Briefing_Choice_2fa_WhyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_why = /** @type {((inputs?: Onboarding_Briefing_Choice_2fa_WhyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_2fa_WhyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_2fa_why(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_2fa_why(inputs)
	return en_onboarding_briefing_choice_2fa_why(inputs)
});