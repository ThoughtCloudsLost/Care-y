/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Success_SubtextInputs */

const en_onboarding_firstlogin_success_subtext = /** @type {(inputs: Onboarding_Firstlogin_Success_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in to get started.`)
};

const es_onboarding_firstlogin_success_subtext = /** @type {(inputs: Onboarding_Firstlogin_Success_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inicia sesion para comenzar.`)
};

/**
* | output |
* | --- |
* | "Sign in to get started." |
*
* @param {Onboarding_Firstlogin_Success_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_success_subtext = /** @type {((inputs?: Onboarding_Firstlogin_Success_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Success_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_success_subtext(inputs)
	return es_onboarding_firstlogin_success_subtext(inputs)
});