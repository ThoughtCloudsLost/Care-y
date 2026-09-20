/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Reauth_Password_PlaceholderInputs */

const en_onboarding_reauth_password_placeholder = /** @type {(inputs: Onboarding_Reauth_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your password`)
};

const es_onboarding_reauth_password_placeholder = /** @type {(inputs: Onboarding_Reauth_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su contraseña`)
};

const en_xa2_onboarding_reauth_password_placeholder = /** @type {(inputs: Onboarding_Reauth_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr pàsswòrd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Your password" |
*
* @param {Onboarding_Reauth_Password_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_password_placeholder = /** @type {((inputs?: Onboarding_Reauth_Password_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Reauth_Password_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_reauth_password_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_reauth_password_placeholder(inputs)
	return en_onboarding_reauth_password_placeholder(inputs)
});