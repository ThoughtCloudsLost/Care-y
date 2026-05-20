/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Reauth_Username_PlaceholderInputs */

const en_onboarding_reauth_username_placeholder = /** @type {(inputs: Onboarding_Reauth_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your username`)
};

const es_onboarding_reauth_username_placeholder = /** @type {(inputs: Onboarding_Reauth_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su nombre de usuario`)
};

/**
* | output |
* | --- |
* | "Your username" |
*
* @param {Onboarding_Reauth_Username_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_username_placeholder = /** @type {((inputs?: Onboarding_Reauth_Username_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Reauth_Username_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_reauth_username_placeholder(inputs)
	return es_onboarding_reauth_username_placeholder(inputs)
});