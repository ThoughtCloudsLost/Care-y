/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Token_PlaceholderInputs */

const en_onboarding_telephony_token_placeholder = /** @type {(inputs: Onboarding_Telephony_Token_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your Twilio auth token`)
};

const es_onboarding_telephony_token_placeholder = /** @type {(inputs: Onboarding_Telephony_Token_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su token de autenticación de Twilio`)
};

const en_xa2_onboarding_telephony_token_placeholder = /** @type {(inputs: Onboarding_Telephony_Token_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr Twìlìò àùth tòkèn •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your Twilio auth token" |
*
* @param {Onboarding_Telephony_Token_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_token_placeholder = /** @type {((inputs?: Onboarding_Telephony_Token_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Token_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_token_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_token_placeholder(inputs)
	return en_onboarding_telephony_token_placeholder(inputs)
});