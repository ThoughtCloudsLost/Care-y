/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Confirm_PasswordInputs */

const en_onboarding_account_confirm_password = /** @type {(inputs: Onboarding_Account_Confirm_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm Password`)
};

const es_onboarding_account_confirm_password = /** @type {(inputs: Onboarding_Account_Confirm_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar contrasena`)
};

/**
* | output |
* | --- |
* | "Confirm Password" |
*
* @param {Onboarding_Account_Confirm_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_confirm_password = /** @type {((inputs?: Onboarding_Account_Confirm_PasswordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Confirm_PasswordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_confirm_password(inputs)
	return es_onboarding_account_confirm_password(inputs)
});