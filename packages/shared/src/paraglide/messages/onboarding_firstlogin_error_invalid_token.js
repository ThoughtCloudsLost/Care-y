/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Error_Invalid_TokenInputs */

const en_onboarding_firstlogin_error_invalid_token = /** @type {(inputs: Onboarding_Firstlogin_Error_Invalid_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This invite link is invalid or has expired.`)
};

const es_onboarding_firstlogin_error_invalid_token = /** @type {(inputs: Onboarding_Firstlogin_Error_Invalid_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace de invitación no es válido o ha expirado.`)
};

const en_xa2_onboarding_firstlogin_error_invalid_token = /** @type {(inputs: Onboarding_Firstlogin_Error_Invalid_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs ìnvìtè lìnk ìs ìnvàlìd òr hàs èxpìrèd. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This invite link is invalid or has expired." |
*
* @param {Onboarding_Firstlogin_Error_Invalid_TokenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_invalid_token = /** @type {((inputs?: Onboarding_Firstlogin_Error_Invalid_TokenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Error_Invalid_TokenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_error_invalid_token(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_error_invalid_token(inputs)
	return en_onboarding_firstlogin_error_invalid_token(inputs)
});