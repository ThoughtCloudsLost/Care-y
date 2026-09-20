/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Username_PlaceholderInputs */

const en_onboarding_account_username_placeholder = /** @type {(inputs: Onboarding_Account_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a login username`)
};

const es_onboarding_account_username_placeholder = /** @type {(inputs: Onboarding_Account_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elige un usuario de inicio de sesión`)
};

const en_xa2_onboarding_account_username_placeholder = /** @type {(inputs: Onboarding_Account_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chòòsè à lògìn ùsèrnàmè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choose a login username" |
*
* @param {Onboarding_Account_Username_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_username_placeholder = /** @type {((inputs?: Onboarding_Account_Username_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Username_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_account_username_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_account_username_placeholder(inputs)
	return en_onboarding_account_username_placeholder(inputs)
});