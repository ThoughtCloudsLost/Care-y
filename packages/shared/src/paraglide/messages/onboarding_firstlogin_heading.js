/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_HeadingInputs */

const en_onboarding_firstlogin_heading = /** @type {(inputs: Onboarding_Firstlogin_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set Up Your Account`)
};

const es_onboarding_firstlogin_heading = /** @type {(inputs: Onboarding_Firstlogin_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configura tu cuenta`)
};

const en_xa2_onboarding_firstlogin_heading = /** @type {(inputs: Onboarding_Firstlogin_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt Ùp Yòùr Àccòùnt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set Up Your Account" |
*
* @param {Onboarding_Firstlogin_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_heading = /** @type {((inputs?: Onboarding_Firstlogin_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_heading(inputs)
	return en_onboarding_firstlogin_heading(inputs)
});