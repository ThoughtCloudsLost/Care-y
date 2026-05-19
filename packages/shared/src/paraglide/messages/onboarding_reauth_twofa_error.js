/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Reauth_Twofa_ErrorInputs */

const en_onboarding_reauth_twofa_error = /** @type {(inputs: Onboarding_Reauth_Twofa_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verification failed. Try again.`)
};

const es_onboarding_reauth_twofa_error = /** @type {(inputs: Onboarding_Reauth_Twofa_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La verificación falló. Intente de nuevo.`)
};

/**
* | output |
* | --- |
* | "Verification failed. Try again." |
*
* @param {Onboarding_Reauth_Twofa_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_twofa_error = /** @type {((inputs?: Onboarding_Reauth_Twofa_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Reauth_Twofa_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_reauth_twofa_error(inputs)
	return es_onboarding_reauth_twofa_error(inputs)
});