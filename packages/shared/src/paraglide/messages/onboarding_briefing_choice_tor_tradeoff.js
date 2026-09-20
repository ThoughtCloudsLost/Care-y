/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Tor_TradeoffInputs */

const en_onboarding_briefing_choice_tor_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`With Tor enabled, users who connect through Tor Browser hide their connection completely. The downside is that Tor is noticeably slower, which can frustrate volunteers during busy shifts.`)
};

const es_onboarding_briefing_choice_tor_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Con Tor habilitado, los usuarios que se conectan a traves del Navegador Tor ocultan su conexión completamente. La desventaja es que Tor es notablemente más lento, lo que puede frustrar a los voluntarios durante turnos ocupados.`)
};

const en_xa2_onboarding_briefing_choice_tor_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wìth Tòr ènàblèd, ùsèrs whò cònnèct thròùgh Tòr Bròwsèr hìdè thèìr cònnèctìòn còmplètèly. Thè dòwnsìdè ìs thàt Tòr ìs nòtìcèàbly slòwèr, whìch càn frùstràtè vòlùntèèrs dùrìng bùsy shìfts. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "With Tor enabled, users who connect through Tor Browser hide their connection completely. The downside is that Tor is noticeably slower, which can frustrate ..." |
*
* @param {Onboarding_Briefing_Choice_Tor_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_tor_tradeoff = /** @type {((inputs?: Onboarding_Briefing_Choice_Tor_TradeoffInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Tor_TradeoffInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_tor_tradeoff(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_tor_tradeoff(inputs)
	return en_onboarding_briefing_choice_tor_tradeoff(inputs)
});