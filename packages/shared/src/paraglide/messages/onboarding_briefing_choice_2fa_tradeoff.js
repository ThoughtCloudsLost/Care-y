/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_2fa_TradeoffInputs */

const en_onboarding_briefing_choice_2fa_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An authenticator app is easy to set up but can still be tricked by a convincing fake login page. A hardware security key (like a YubiKey) checks the website address automatically and cannot be fooled. Hardware keys cost money and volunteers need to carry them.`)
};

const es_onboarding_briefing_choice_2fa_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una aplicacion autenticadora es facil de configurar pero puede ser enganada por una pagina falsa convincente. Una llave de seguridad fisica (como YubiKey) verifica la direccion del sitio automaticamente y no puede ser enganada. Las llaves fisicas cuestan dinero y los voluntarios necesitan llevarlas consigo.`)
};

/**
* | output |
* | --- |
* | "An authenticator app is easy to set up but can still be tricked by a convincing fake login page. A hardware security key (like a YubiKey) checks the website ..." |
*
* @param {Onboarding_Briefing_Choice_2fa_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_tradeoff = /** @type {((inputs?: Onboarding_Briefing_Choice_2fa_TradeoffInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_2fa_TradeoffInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_2fa_tradeoff(inputs)
	return es_onboarding_briefing_choice_2fa_tradeoff(inputs)
});