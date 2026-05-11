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

/**
* | output |
* | --- |
* | "Account SID is required." |
*
* @param {Onboarding_Telephony_Error_Sid_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_error_sid_required = /** @type {((inputs?: Onboarding_Telephony_Error_Sid_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Error_Sid_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_error_sid_required(inputs)
	return es_onboarding_telephony_error_sid_required(inputs)
});