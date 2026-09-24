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

const en_xa2_onboarding_branding_logo_invalid_type = /** @type {(inputs: Onboarding_Branding_Logo_Invalid_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnsùppòrtèd ìmàgè fòrmàt. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unsupported image format." |
*
* @param {Onboarding_Branding_Logo_Invalid_TypeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_invalid_type = /** @type {((inputs?: Onboarding_Branding_Logo_Invalid_TypeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Logo_Invalid_TypeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_logo_invalid_type(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_logo_invalid_type(inputs)
	return en_onboarding_branding_logo_invalid_type(inputs)
});