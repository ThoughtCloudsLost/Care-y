/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Username_CompromiseInputs */

const en_onboarding_briefing_practice_username_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Username_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login usernames only. No passwords are stored.`)
};

const es_onboarding_briefing_practice_username_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Username_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo usuarios de inicio de sesión. No se almacenan contraseñas.`)
};

const en_xa2_onboarding_briefing_practice_username_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Username_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lògìn ùsèrnàmès ònly. Nò pàsswòrds àrè stòrèd. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Login usernames only. No passwords are stored." |
*
* @param {Onboarding_Briefing_Practice_Username_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_username_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Username_CompromiseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Username_CompromiseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_username_compromise(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_username_compromise(inputs)
	return en_onboarding_briefing_practice_username_compromise(inputs)
});