/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Vpn_ProtectsInputs */

const en_onboarding_briefing_choice_vpn_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your internet provider or local network operator seeing that volunteers connect to this service, and learning their physical location from their IP address.`)
};

const es_onboarding_briefing_choice_vpn_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Que tu proveedor de internet u operador de red local vea que los voluntarios se conectan a este servicio, y que descubra su ubicación fisica por su dirección IP.`)
};

const en_xa2_onboarding_briefing_choice_vpn_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr ìntèrnèt pròvìdèr òr lòcàl nètwòrk òpèràtòr sèèìng thàt vòlùntèèrs cònnèct tò thìs sèrvìcè, ànd lèàrnìng thèìr physìcàl lòcàtìòn fròm thèìr ÌP àddrèss. •••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your internet provider or local network operator seeing that volunteers connect to this service, and learning their physical location from their IP address." |
*
* @param {Onboarding_Briefing_Choice_Vpn_ProtectsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_vpn_protects = /** @type {((inputs?: Onboarding_Briefing_Choice_Vpn_ProtectsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Vpn_ProtectsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_vpn_protects(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_vpn_protects(inputs)
	return en_onboarding_briefing_choice_vpn_protects(inputs)
});