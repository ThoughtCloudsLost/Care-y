/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Error_Password_MismatchInputs */

const en_onboarding_firstlogin_error_password_mismatch = /** @type {(inputs: Onboarding_Firstlogin_Error_Password_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passwords do not match.`)
};

const es_onboarding_firstlogin_error_password_mismatch = /** @type {(inputs: Onboarding_Firstlogin_Error_Password_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las contraseñas no coinciden.`)
};

const en_xa2_onboarding_firstlogin_error_password_mismatch = /** @type {(inputs: Onboarding_Firstlogin_Error_Password_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrds dò nòt màtch. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Onboarding_Firstlogin_Error_Password_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_password_mismatch = /** @type {((inputs?: Onboarding_Firstlogin_Error_Password_MismatchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Error_Password_MismatchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_error_password_mismatch(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_error_password_mismatch(inputs)
	return en_onboarding_firstlogin_error_password_mismatch(inputs)
});