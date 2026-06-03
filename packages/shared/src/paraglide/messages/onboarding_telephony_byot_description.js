/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Byot_DescriptionInputs */

const en_onboarding_telephony_byot_description = /** @type {(inputs: Onboarding_Telephony_Byot_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bring your own Twilio credentials. You manage the account and phone numbers.`)
};

const es_onboarding_telephony_byot_description = /** @type {(inputs: Onboarding_Telephony_Byot_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Traiga sus propias credenciales de Twilio. Usted administra la cuenta y los numeros.`)
};

/**
* | output |
* | --- |
* | "Bring your own Twilio credentials. You manage the account and phone numbers." |
*
* @param {Onboarding_Telephony_Byot_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_byot_description = /** @type {((inputs?: Onboarding_Telephony_Byot_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Byot_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_byot_description(inputs)
	return es_onboarding_telephony_byot_description(inputs)
});