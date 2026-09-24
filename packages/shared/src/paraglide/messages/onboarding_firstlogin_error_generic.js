/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Error_GenericInputs */

const en_onboarding_firstlogin_error_generic = /** @type {(inputs: Onboarding_Firstlogin_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account creation failed. Please try again.`)
};

const es_onboarding_firstlogin_error_generic = /** @type {(inputs: Onboarding_Firstlogin_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo crear la cuenta. Inténtalo de nuevo.`)
};

const en_xa2_onboarding_firstlogin_error_generic = /** @type {(inputs: Onboarding_Firstlogin_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt crèàtìòn fàìlèd. Plèàsè try àgàìn. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Account creation failed. Please try again." |
*
* @param {Onboarding_Firstlogin_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_generic = /** @type {((inputs?: Onboarding_Firstlogin_Error_GenericInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Error_GenericInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_error_generic(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_error_generic(inputs)
	return en_onboarding_firstlogin_error_generic(inputs)
});