/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Vpn_ProtectsInputs */

const en_onboarding_briefing_choice_vpn_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your internet provider or local network operator seeing that volunteers connect to this service, and learning their physical location from their IP address.`)
};

const es_onboarding_briefing_choice_vpn_protects = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_ProtectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Que tu proveedor de internet u operador de red local vea que los voluntarios se conectan a este servicio, y que descubra su ubicacion fisica por su direccion IP.`)
};

/**
* | output |
* | --- |
* | "Your internet provider or local network operator seeing that volunteers connect to this service, and learning their physical location from their IP address." |
*
* @param {Onboarding_Briefing_Choice_Vpn_ProtectsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_vpn_protects = /** @type {((inputs?: Onboarding_Briefing_Choice_Vpn_ProtectsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Vpn_ProtectsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_vpn_protects(inputs)
	return es_onboarding_briefing_choice_vpn_protects(inputs)
});