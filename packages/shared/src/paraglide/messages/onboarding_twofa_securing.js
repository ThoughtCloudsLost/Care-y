/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_SecuringInputs */

const en_onboarding_twofa_securing = /** @type {(inputs: Onboarding_Twofa_SecuringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Securing session...`)
};

const es_onboarding_twofa_securing = /** @type {(inputs: Onboarding_Twofa_SecuringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asegurando sesion...`)
};

/**
* | output |
* | --- |
* | "Securing session..." |
*
* @param {Onboarding_Twofa_SecuringInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_securing = /** @type {((inputs?: Onboarding_Twofa_SecuringInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_SecuringInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_twofa_securing(inputs)
	return es_onboarding_twofa_securing(inputs)
});