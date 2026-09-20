/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Error_Sid_RequiredInputs */

const en_onboarding_telephony_error_sid_required = /** @type {(inputs: Onboarding_Telephony_Error_Sid_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account SID is required.`)
};

const es_onboarding_telephony_error_sid_required = /** @type {(inputs: Onboarding_Telephony_Error_Sid_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El Account SID es obligatorio.`)
};

const en_xa2_onboarding_telephony_error_sid_required = /** @type {(inputs: Onboarding_Telephony_Error_Sid_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt SÌD ìs rèqùìrèd. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Account SID is required." |
*
* @param {Onboarding_Telephony_Error_Sid_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_error_sid_required = /** @type {((inputs?: Onboarding_Telephony_Error_Sid_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Error_Sid_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_error_sid_required(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_error_sid_required(inputs)
	return en_onboarding_telephony_error_sid_required(inputs)
});