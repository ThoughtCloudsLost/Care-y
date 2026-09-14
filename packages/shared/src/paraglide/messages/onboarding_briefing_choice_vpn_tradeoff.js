/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Vpn_TradeoffInputs */

const en_onboarding_briefing_choice_vpn_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A VPN is faster and simpler than Tor, making it a good everyday option. Volunteers can install a VPN app on their phone or computer in minutes. The tradeoff is that you are trusting the VPN provider not to log or share your traffic. For the highest protection, Tor hides your connection from everyone. Even the VPN provider cannot see your destination, but Tor is slower. Many organizations recommend a VPN for daily use and Tor for the most sensitive situations.`)
};

const es_onboarding_briefing_choice_vpn_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una VPN es más rápida y sencilla que Tor, lo que la convierte en una buena opción para el uso diario. Los voluntarios pueden instalar una aplicación de VPN en su teléfono o computadora en minutos. La desventaja es que confias en que el proveedor de VPN no registre ni comparta tu tráfico. Para la máxima protección, Tor oculta tu conexión de todos. Ni siquiera el proveedor de VPN puede ver tu destino, pero Tor es más lento. Muchas organizaciones recomiendan una VPN para el uso diario y Tor para las situaciones más sensibles.`)
};

/**
* | output |
* | --- |
* | "A VPN is faster and simpler than Tor, making it a good everyday option. Volunteers can install a VPN app on their phone or computer in minutes. The tradeoff ..." |
*
* @param {Onboarding_Briefing_Choice_Vpn_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_vpn_tradeoff = /** @type {((inputs?: Onboarding_Briefing_Choice_Vpn_TradeoffInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Vpn_TradeoffInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_vpn_tradeoff(inputs)
	return en_onboarding_briefing_choice_vpn_tradeoff(inputs)
});