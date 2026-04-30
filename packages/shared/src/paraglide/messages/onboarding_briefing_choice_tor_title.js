/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Tor_TitleInputs */

const en_onboarding_briefing_choice_tor_title = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tor hidden service access`)
};

const es_onboarding_briefing_choice_tor_title = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acceso por servicio oculto Tor`)
};

/**
* | output |
* | --- |
* | "Tor hidden service access" |
*
* @param {Onboarding_Briefing_Choice_Tor_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_tor_title = /** @type {((inputs?: Onboarding_Briefing_Choice_Tor_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Tor_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_tor_title(inputs)
	return es_onboarding_briefing_choice_tor_title(inputs)
});