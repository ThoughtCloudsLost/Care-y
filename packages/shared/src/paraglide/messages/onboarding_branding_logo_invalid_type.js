/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Logo_Invalid_TypeInputs */

const en_onboarding_branding_logo_invalid_type = /** @type {(inputs: Onboarding_Branding_Logo_Invalid_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unsupported image format.`)
};

const es_onboarding_branding_logo_invalid_type = /** @type {(inputs: Onboarding_Branding_Logo_Invalid_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formato de imagen no compatible.`)
};

/**
* | output |
* | --- |
* | "Unsupported image format." |
*
* @param {Onboarding_Branding_Logo_Invalid_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_invalid_type = /** @type {((inputs?: Onboarding_Branding_Logo_Invalid_TypeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Logo_Invalid_TypeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_logo_invalid_type(inputs)
	return es_onboarding_branding_logo_invalid_type(inputs)
});