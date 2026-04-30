/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Username_AccessInputs */

const en_onboarding_briefing_practice_username_access = /** @type {(inputs: Onboarding_Briefing_Practice_Username_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server (for login lookup)`)
};

const es_onboarding_briefing_practice_username_access = /** @type {(inputs: Onboarding_Briefing_Practice_Username_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor (para verificar inicio de sesion)`)
};

/**
* | output |
* | --- |
* | "The server (for login lookup)" |
*
* @param {Onboarding_Briefing_Practice_Username_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_username_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Username_AccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Username_AccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_username_access(inputs)
	return es_onboarding_briefing_practice_username_access(inputs)
});