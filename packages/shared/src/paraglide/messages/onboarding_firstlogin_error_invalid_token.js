/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Error_Invalid_TokenInputs */

const en_onboarding_firstlogin_error_invalid_token = /** @type {(inputs: Onboarding_Firstlogin_Error_Invalid_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This invite link is invalid or has expired.`)
};

const es_onboarding_firstlogin_error_invalid_token = /** @type {(inputs: Onboarding_Firstlogin_Error_Invalid_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace de invitacion no es valido o ha expirado.`)
};

/**
* | output |
* | --- |
* | "This invite link is invalid or has expired." |
*
* @param {Onboarding_Firstlogin_Error_Invalid_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_invalid_token = /** @type {((inputs?: Onboarding_Firstlogin_Error_Invalid_TokenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Error_Invalid_TokenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_error_invalid_token(inputs)
	return es_onboarding_firstlogin_error_invalid_token(inputs)
});