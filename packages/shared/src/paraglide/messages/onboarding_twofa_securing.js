/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_SecuringInputs */

const en_onboarding_twofa_securing = /** @type {(inputs: Onboarding_Twofa_SecuringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Securing session...`)
};

const es_onboarding_twofa_securing = /** @type {(inputs: Onboarding_Twofa_SecuringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asegurando sesión...`)
};

const en_xa2_onboarding_twofa_securing = /** @type {(inputs: Onboarding_Twofa_SecuringInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrìng sèssìòn... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Securing session..." |
*
* @param {Onboarding_Twofa_SecuringInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_securing = /** @type {((inputs?: Onboarding_Twofa_SecuringInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_SecuringInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_twofa_securing(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_twofa_securing(inputs)
	return en_onboarding_twofa_securing(inputs)
});