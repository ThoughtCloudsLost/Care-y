/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Error_Token_RequiredInputs */

const en_onboarding_telephony_error_token_required = /** @type {(inputs: Onboarding_Telephony_Error_Token_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auth Token is required.`)
};

const es_onboarding_telephony_error_token_required = /** @type {(inputs: Onboarding_Telephony_Error_Token_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El Auth Token es obligatorio.`)
};

const en_xa2_onboarding_telephony_error_token_required = /** @type {(inputs: Onboarding_Telephony_Error_Token_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùth Tòkèn ìs rèqùìrèd. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Auth Token is required." |
*
* @param {Onboarding_Telephony_Error_Token_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_error_token_required = /** @type {((inputs?: Onboarding_Telephony_Error_Token_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Error_Token_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_error_token_required(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_error_token_required(inputs)
	return en_onboarding_telephony_error_token_required(inputs)
});