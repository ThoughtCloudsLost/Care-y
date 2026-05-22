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

/**
* | output |
* | --- |
* | "VPN usage for volunteers" |
*
* @param {Onboarding_Briefing_Choice_Vpn_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_vpn_title = /** @type {((inputs?: Onboarding_Briefing_Choice_Vpn_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Vpn_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_vpn_title(inputs)
	return es_onboarding_briefing_choice_vpn_title(inputs)
});