/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Password_PlaceholderInputs */

const en_onboarding_firstlogin_password_placeholder = /** @type {(inputs: Onboarding_Firstlogin_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`At least 12 characters`)
};

const es_onboarding_firstlogin_password_placeholder = /** @type {(inputs: Onboarding_Firstlogin_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al menos 12 caracteres`)
};

/**
* | output |
* | --- |
* | "At least 12 characters" |
*
* @param {Onboarding_Firstlogin_Password_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_password_placeholder = /** @type {((inputs?: Onboarding_Firstlogin_Password_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Password_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_password_placeholder(inputs)
	return es_onboarding_firstlogin_password_placeholder(inputs)
});