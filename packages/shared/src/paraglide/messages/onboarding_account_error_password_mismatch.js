/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Error_Password_MismatchInputs */

const en_onboarding_account_error_password_mismatch = /** @type {(inputs: Onboarding_Account_Error_Password_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passwords do not match.`)
};

const es_onboarding_account_error_password_mismatch = /** @type {(inputs: Onboarding_Account_Error_Password_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las contrasenas no coinciden.`)
};

/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Onboarding_Account_Error_Password_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_error_password_mismatch = /** @type {((inputs?: Onboarding_Account_Error_Password_MismatchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Error_Password_MismatchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_error_password_mismatch(inputs)
	return es_onboarding_account_error_password_mismatch(inputs)
});