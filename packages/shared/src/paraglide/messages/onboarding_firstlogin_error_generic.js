/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Error_GenericInputs */

const en_onboarding_firstlogin_error_generic = /** @type {(inputs: Onboarding_Firstlogin_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account creation failed. Please try again.`)
};

const es_onboarding_firstlogin_error_generic = /** @type {(inputs: Onboarding_Firstlogin_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo crear la cuenta. Intentalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "Account creation failed. Please try again." |
*
* @param {Onboarding_Firstlogin_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_generic = /** @type {((inputs?: Onboarding_Firstlogin_Error_GenericInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Error_GenericInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_error_generic(inputs)
	return es_onboarding_firstlogin_error_generic(inputs)
});