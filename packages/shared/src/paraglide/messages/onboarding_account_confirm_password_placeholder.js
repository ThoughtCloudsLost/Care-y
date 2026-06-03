/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Confirm_Password_PlaceholderInputs */

const en_onboarding_account_confirm_password_placeholder = /** @type {(inputs: Onboarding_Account_Confirm_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter password again`)
};

const es_onboarding_account_confirm_password_placeholder = /** @type {(inputs: Onboarding_Account_Confirm_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa la contrasena otra vez`)
};

/**
* | output |
* | --- |
* | "Enter password again" |
*
* @param {Onboarding_Account_Confirm_Password_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_confirm_password_placeholder = /** @type {((inputs?: Onboarding_Account_Confirm_Password_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Confirm_Password_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_confirm_password_placeholder(inputs)
	return es_onboarding_account_confirm_password_placeholder(inputs)
});