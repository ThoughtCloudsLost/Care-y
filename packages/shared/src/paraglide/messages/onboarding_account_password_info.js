/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Password_InfoInputs */

const en_onboarding_account_password_info = /** @type {(inputs: Onboarding_Account_Password_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Minimum 16 characters. This password derives your encryption keys.`)
};

const es_onboarding_account_password_info = /** @type {(inputs: Onboarding_Account_Password_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Minimo 16 caracteres. Esta contrasena genera tus claves de cifrado.`)
};

/**
* | output |
* | --- |
* | "Minimum 16 characters. This password derives your encryption keys." |
*
* @param {Onboarding_Account_Password_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_password_info = /** @type {((inputs?: Onboarding_Account_Password_InfoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Password_InfoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_password_info(inputs)
	return es_onboarding_account_password_info(inputs)
});