/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Success_HeadingInputs */

const en_onboarding_firstlogin_success_heading = /** @type {(inputs: Onboarding_Firstlogin_Success_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your account is ready.`)
};

const es_onboarding_firstlogin_success_heading = /** @type {(inputs: Onboarding_Firstlogin_Success_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu cuenta está lista.`)
};

const en_xa2_onboarding_firstlogin_success_heading = /** @type {(inputs: Onboarding_Firstlogin_Success_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr àccòùnt ìs rèàdy. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your account is ready." |
*
* @param {Onboarding_Firstlogin_Success_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_success_heading = /** @type {((inputs?: Onboarding_Firstlogin_Success_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Success_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_success_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_success_heading(inputs)
	return en_onboarding_firstlogin_success_heading(inputs)
});