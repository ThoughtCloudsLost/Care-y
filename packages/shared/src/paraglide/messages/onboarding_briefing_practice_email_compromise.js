/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Email_CompromiseInputs */

const en_onboarding_briefing_practice_email_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Email_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email addresses of volunteers who opted in. No client data.`)
};

const es_onboarding_briefing_practice_email_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Email_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correos de voluntarios que optaron por recibirlos. Sin datos de clientes.`)
};

/**
* | output |
* | --- |
* | "Email addresses of volunteers who opted in. No client data." |
*
* @param {Onboarding_Briefing_Practice_Email_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_email_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Email_CompromiseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Email_CompromiseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_email_compromise(inputs)
	return es_onboarding_briefing_practice_email_compromise(inputs)
});