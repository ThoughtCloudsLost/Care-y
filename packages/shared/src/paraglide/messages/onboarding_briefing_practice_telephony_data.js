/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Telephony_DataInputs */

const en_onboarding_briefing_practice_telephony_data = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone system credentials`)
};

const es_onboarding_briefing_practice_telephony_data = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Credenciales del sistema telefónico`)
};

const en_xa2_onboarding_briefing_practice_telephony_data = /** @type {(inputs: Onboarding_Briefing_Practice_Telephony_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè systèm crèdèntìàls ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone system credentials" |
*
* @param {Onboarding_Briefing_Practice_Telephony_DataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_telephony_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Telephony_DataInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Telephony_DataInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_telephony_data(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_telephony_data(inputs)
	return en_onboarding_briefing_practice_telephony_data(inputs)
});