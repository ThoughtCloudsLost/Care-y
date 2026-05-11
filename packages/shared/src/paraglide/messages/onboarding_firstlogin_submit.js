/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_SubmitInputs */

const en_onboarding_firstlogin_submit = /** @type {(inputs: Onboarding_Firstlogin_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Account`)
};

const es_onboarding_firstlogin_submit = /** @type {(inputs: Onboarding_Firstlogin_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear cuenta`)
};

/**
* | output |
* | --- |
* | "Create Account" |
*
* @param {Onboarding_Firstlogin_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_submit = /** @type {((inputs?: Onboarding_Firstlogin_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_submit(inputs)
	return es_onboarding_firstlogin_submit(inputs)
});