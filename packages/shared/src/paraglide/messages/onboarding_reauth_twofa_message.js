/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Reauth_Twofa_MessageInputs */

const en_onboarding_reauth_twofa_message = /** @type {(inputs: Onboarding_Reauth_Twofa_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify your identity to continue setup.`)
};

const es_onboarding_reauth_twofa_message = /** @type {(inputs: Onboarding_Reauth_Twofa_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifique su identidad para continuar la configuración.`)
};

/**
* | output |
* | --- |
* | "Verify your identity to continue setup." |
*
* @param {Onboarding_Reauth_Twofa_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_twofa_message = /** @type {((inputs?: Onboarding_Reauth_Twofa_MessageInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Reauth_Twofa_MessageInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_reauth_twofa_message(inputs)
	return es_onboarding_reauth_twofa_message(inputs)
});