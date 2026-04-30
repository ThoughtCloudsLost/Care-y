/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Email_DataInputs */

const en_onboarding_briefing_practice_email_data = /** @type {(inputs: Onboarding_Briefing_Practice_Email_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer email addresses (opt-in only)`)
};

const es_onboarding_briefing_practice_email_data = /** @type {(inputs: Onboarding_Briefing_Practice_Email_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correos de voluntarios (solo si optaron por recibirlos)`)
};

/**
* | output |
* | --- |
* | "Volunteer email addresses (opt-in only)" |
*
* @param {Onboarding_Briefing_Practice_Email_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_email_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Email_DataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Email_DataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_email_data(inputs)
	return es_onboarding_briefing_practice_email_data(inputs)
});