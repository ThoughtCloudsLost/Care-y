/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_2fa_TitleInputs */

const en_onboarding_briefing_choice_2fa_title = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two-factor authentication policy`)
};

const es_onboarding_briefing_choice_2fa_title = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Politica de autenticacion de dos factores`)
};

/**
* | output |
* | --- |
* | "Two-factor authentication policy" |
*
* @param {Onboarding_Briefing_Choice_2fa_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_title = /** @type {((inputs?: Onboarding_Briefing_Choice_2fa_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_2fa_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_2fa_title(inputs)
	return es_onboarding_briefing_choice_2fa_title(inputs)
});