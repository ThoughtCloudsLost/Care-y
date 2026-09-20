/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Email_AccessInputs */

const en_onboarding_briefing_practice_email_access = /** @type {(inputs: Onboarding_Briefing_Practice_Email_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server (for sending notifications)`)
};

const es_onboarding_briefing_practice_email_access = /** @type {(inputs: Onboarding_Briefing_Practice_Email_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor (para enviar notificaciones)`)
};

const en_xa2_onboarding_briefing_practice_email_access = /** @type {(inputs: Onboarding_Briefing_Practice_Email_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèrvèr (fòr sèndìng nòtìfìcàtìòns) ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The server (for sending notifications)" |
*
* @param {Onboarding_Briefing_Practice_Email_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_email_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Email_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Email_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_email_access(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_email_access(inputs)
	return en_onboarding_briefing_practice_email_access(inputs)
});