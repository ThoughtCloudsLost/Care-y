/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Username_DataInputs */

const en_onboarding_briefing_practice_username_data = /** @type {(inputs: Onboarding_Briefing_Practice_Username_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer usernames`)
};

const es_onboarding_briefing_practice_username_data = /** @type {(inputs: Onboarding_Briefing_Practice_Username_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombres de usuario de voluntarios`)
};

/**
* | output |
* | --- |
* | "Volunteer usernames" |
*
* @param {Onboarding_Briefing_Practice_Username_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_username_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Username_DataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Username_DataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_username_data(inputs)
	return es_onboarding_briefing_practice_username_data(inputs)
});