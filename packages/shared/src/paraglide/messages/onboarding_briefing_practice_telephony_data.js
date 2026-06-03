/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Telephony_DataInputs */

const en_onboarding_briefing_practice_telephony_data = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone system credentials`)
};

const es_onboarding_briefing_practice_telephony_data = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Credenciales del sistema telefonico`)
};

/**
* | output |
* | --- |
* | "Phone system credentials" |
*
* @param {Onboarding_Briefing_Practice_Telephony_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_telephony_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Telephony_DataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Telephony_DataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_telephony_data(inputs)
	return es_onboarding_briefing_practice_telephony_data(inputs)
});