/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Vpn_TradeoffInputs */

const en_onboarding_briefing_choice_vpn_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A VPN is faster and simpler than Tor, making it a good everyday option. Volunteers can install a VPN app on their phone or computer in minutes. The tradeoff is that you are trusting the VPN provider not to log or share your traffic. For the highest protection, Tor hides your connection from everyone, including the VPN provider, but is slower. Many organizations recommend a VPN for daily use and Tor for the most sensitive situations.`)
};

const es_onboarding_briefing_choice_vpn_tradeoff = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_TradeoffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una VPN es mas rapida y sencilla que Tor, lo que la convierte en una buena opcion para el uso diario. Los voluntarios pueden instalar una aplicacion de VPN en su telefono o computadora en minutos. La desventaja es que confias en que el proveedor de VPN no registre ni comparta tu trafico. Para la maxima proteccion, Tor oculta tu conexion de todos, incluyendo al proveedor de VPN, pero es mas lento. Muchas organizaciones recomiendan una VPN para el uso diario y Tor para las situaciones mas sensibles.`)
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
	if (locale === "en") return en_onboarding_briefing_choice_vpn_tradeoff(inputs)
	return es_onboarding_briefing_choice_vpn_tradeoff(inputs)
});