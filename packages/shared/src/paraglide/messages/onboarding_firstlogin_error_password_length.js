/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Error_Password_LengthInputs */

const en_onboarding_firstlogin_error_password_length = /** @type {(inputs: Onboarding_Firstlogin_Error_Password_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password must be at least 16 characters.`)
};

const es_onboarding_firstlogin_error_password_length = /** @type {(inputs: Onboarding_Firstlogin_Error_Password_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La contraseña debe tener al menos 16 caracteres.`)
};

const en_xa2_onboarding_firstlogin_error_password_length = /** @type {(inputs: Onboarding_Firstlogin_Error_Password_LengthInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrd mùst bè àt lèàst 16 chàràctèrs. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Password must be at least 16 characters." |
*
* @param {Onboarding_Firstlogin_Error_Password_LengthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_password_length = /** @type {((inputs?: Onboarding_Firstlogin_Error_Password_LengthInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Error_Password_LengthInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_error_password_length(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_error_password_length(inputs)
	return en_onboarding_firstlogin_error_password_length(inputs)
});