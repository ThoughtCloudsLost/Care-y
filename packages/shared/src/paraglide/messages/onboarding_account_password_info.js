/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Password_InfoInputs */

const en_onboarding_account_password_info = /** @type {(inputs: Onboarding_Account_Password_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Minimum 16 characters. This password derives your encryption keys.`)
};

const es_onboarding_account_password_info = /** @type {(inputs: Onboarding_Account_Password_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Minimo 16 caracteres. Esta contraseña genera tus claves de cifrado.`)
};

const en_xa2_onboarding_account_password_info = /** @type {(inputs: Onboarding_Account_Password_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mìnìmùm 16 chàràctèrs. Thìs pàsswòrd dèrìvès yòùr èncryptìòn kèys. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Minimum 16 characters. This password derives your encryption keys." |
*
* @param {Onboarding_Account_Password_InfoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_password_info = /** @type {((inputs?: Onboarding_Account_Password_InfoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Password_InfoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_account_password_info(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_account_password_info(inputs)
	return en_onboarding_account_password_info(inputs)
});