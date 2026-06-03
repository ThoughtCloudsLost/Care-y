/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Username_PlaceholderInputs */

const en_onboarding_firstlogin_username_placeholder = /** @type {(inputs: Onboarding_Firstlogin_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Username`)
};

const es_onboarding_firstlogin_username_placeholder = /** @type {(inputs: Onboarding_Firstlogin_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario de inicio de sesion`)
};

/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Onboarding_Firstlogin_Username_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_username_placeholder = /** @type {((inputs?: Onboarding_Firstlogin_Username_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Username_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_username_placeholder(inputs)
	return es_onboarding_firstlogin_username_placeholder(inputs)
});