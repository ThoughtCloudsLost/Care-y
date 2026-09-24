/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Vpn_TitleInputs */

const en_onboarding_briefing_choice_vpn_title = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`VPN usage for volunteers`)
};

const es_onboarding_briefing_choice_vpn_title = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uso de VPN para voluntarios`)
};

const en_xa2_onboarding_briefing_choice_vpn_title = /** @type {(inputs: Onboarding_Briefing_Choice_Vpn_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦VPN ùsàgè fòr vòlùntèèrs ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "VPN usage for volunteers" |
*
* @param {Onboarding_Briefing_Choice_Vpn_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_vpn_title = /** @type {((inputs?: Onboarding_Briefing_Choice_Vpn_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Vpn_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_choice_vpn_title(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_choice_vpn_title(inputs)
	return en_onboarding_briefing_choice_vpn_title(inputs)
});