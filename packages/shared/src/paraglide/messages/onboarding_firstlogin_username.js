/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_UsernameInputs */

const en_onboarding_firstlogin_username = /** @type {(inputs: Onboarding_Firstlogin_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a Username`)
};

const es_onboarding_firstlogin_username = /** @type {(inputs: Onboarding_Firstlogin_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elige un nombre de usuario`)
};

/**
* | output |
* | --- |
* | "Choose a Username" |
*
* @param {Onboarding_Firstlogin_UsernameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_username = /** @type {((inputs?: Onboarding_Firstlogin_UsernameInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_UsernameInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_username(inputs)
	return es_onboarding_firstlogin_username(inputs)
});