/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Error_Password_LengthInputs */

const en_onboarding_account_error_password_length = /** @type {(inputs: Onboarding_Account_Error_Password_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password must be at least 12 characters.`)
};

const es_onboarding_account_error_password_length = /** @type {(inputs: Onboarding_Account_Error_Password_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La contrasena debe tener al menos 12 caracteres.`)
};

/**
* | output |
* | --- |
* | "Password must be at least 12 characters." |
*
* @param {Onboarding_Account_Error_Password_LengthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_error_password_length = /** @type {((inputs?: Onboarding_Account_Error_Password_LengthInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Error_Password_LengthInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_error_password_length(inputs)
	return es_onboarding_account_error_password_length(inputs)
});