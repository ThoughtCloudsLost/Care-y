/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_2fa_TradeoffInputs */

const en_onboarding_briefing_choice_2fa_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An authenticator app is easy to set up but can still be tricked by a convincing fake login page. A hardware security key (like a YubiKey) checks the website address automatically and cannot be fooled. Hardware keys cost money and volunteers need to carry them.`)
};

const es_onboarding_briefing_choice_2fa_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una aplicación autenticadora es fácil de configurar pero puede ser enganada por una página falsa convincente. Una llave de seguridad fisica (como YubiKey) verifica la dirección del sitio automáticamente y no puede ser enganada. Las llaves fisicas cuestan dinero y los voluntarios necesitan llevarlas consigo.`)
};

const en_xa2_onboarding_briefing_choice_2fa_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àùthèntìcàtòr àpp ìs èàsy tò sèt ùp bùt càn stìll bè trìckèd by à cònvìncìng fàkè lògìn pàgè. À hàrdwàrè sècùrìty kèy (lìkè à YùbìKèy) chècks thè wèbsìtè àddrèss àùtòmàtìcàlly ànd cànnòt bè fòòlèd. Hàrdwàrè kèys còst mònèy ànd vòlùntèèrs nèèd tò càrry thèm. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An authenticator app is easy to set up but can still be tricked by a convincing fake login page. A hardware security key (like a YubiKey) checks the website ..." |
*
* @param {Onboarding_Briefing_Choice_2fa_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_tradeoff = /** @type {((inputs?: Onboarding_Briefing_Choice_2fa_TradeoffInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_2fa_TradeoffInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_2fa_tradeoff(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_2fa_tradeoff(inputs)
	return en_onboarding_briefing_choice_2fa_tradeoff(inputs)
});