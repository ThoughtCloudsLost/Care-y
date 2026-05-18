/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_HeadingInputs */

const en_onboarding_twofa_heading = /** @type {(inputs: Onboarding_Twofa_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set Up Two-Factor Authentication`)
};

const es_onboarding_twofa_heading = /** @type {(inputs: Onboarding_Twofa_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar autenticacion de dos factores`)
};

/**
* | output |
* | --- |
* | "Set Up Two-Factor Authentication" |
*
* @param {Onboarding_Twofa_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_heading = /** @type {((inputs?: Onboarding_Twofa_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_twofa_heading(inputs)
	return es_onboarding_twofa_heading(inputs)
});