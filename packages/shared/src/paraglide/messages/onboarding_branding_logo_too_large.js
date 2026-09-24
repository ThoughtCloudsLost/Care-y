/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Logo_Too_LargeInputs */

const en_onboarding_branding_logo_too_large = /** @type {(inputs: Onboarding_Branding_Logo_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Image exceeds 512 KB limit.`)
};

const es_onboarding_branding_logo_too_large = /** @type {(inputs: Onboarding_Branding_Logo_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La imagen excede el limite de 512 KB.`)
};

const en_xa2_onboarding_branding_logo_too_large = /** @type {(inputs: Onboarding_Branding_Logo_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìmàgè èxcèèds 512 KB lìmìt. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Image exceeds 512 KB limit." |
*
* @param {Onboarding_Branding_Logo_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_too_large = /** @type {((inputs?: Onboarding_Branding_Logo_Too_LargeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Logo_Too_LargeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_logo_too_large(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_logo_too_large(inputs)
	return en_onboarding_branding_logo_too_large(inputs)
});