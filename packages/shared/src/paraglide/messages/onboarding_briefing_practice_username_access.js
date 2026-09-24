/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Username_AccessInputs */

const en_onboarding_briefing_practice_username_access = /** @type {(inputs: Onboarding_Briefing_Practice_Username_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server (for login lookup)`)
};

const es_onboarding_briefing_practice_username_access = /** @type {(inputs: Onboarding_Briefing_Practice_Username_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor (para verificar inicio de sesión)`)
};

const en_xa2_onboarding_briefing_practice_username_access = /** @type {(inputs: Onboarding_Briefing_Practice_Username_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèrvèr (fòr lògìn lòòkùp) •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The server (for login lookup)" |
*
* @param {Onboarding_Briefing_Practice_Username_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_username_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Username_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Username_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_username_access(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_username_access(inputs)
	return en_onboarding_briefing_practice_username_access(inputs)
});