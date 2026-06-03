/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_PasswordInputs */

const en_onboarding_firstlogin_password = /** @type {(inputs: Onboarding_Firstlogin_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password`)
};

const es_onboarding_firstlogin_password = /** @type {(inputs: Onboarding_Firstlogin_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasena`)
};

/**
* | output |
* | --- |
* | "Password" |
*
* @param {Onboarding_Firstlogin_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_password = /** @type {((inputs?: Onboarding_Firstlogin_PasswordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_PasswordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_password(inputs)
	return es_onboarding_firstlogin_password(inputs)
});