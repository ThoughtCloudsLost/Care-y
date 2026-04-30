/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Username_CompromiseInputs */

const en_onboarding_briefing_practice_username_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Username_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usernames only. No passwords are stored.`)
};

const es_onboarding_briefing_practice_username_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Username_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo nombres de usuario. No se almacenan contrasenas.`)
};

/**
* | output |
* | --- |
* | "Usernames only. No passwords are stored." |
*
* @param {Onboarding_Briefing_Practice_Username_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_username_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Username_CompromiseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Username_CompromiseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_username_compromise(inputs)
	return es_onboarding_briefing_practice_username_compromise(inputs)
});