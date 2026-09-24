/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Logo_HintInputs */

const en_onboarding_branding_logo_hint = /** @type {(inputs: Onboarding_Branding_Logo_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PNG, JPEG, or SVG. Max 512 KB.`)
};

const es_onboarding_branding_logo_hint = /** @type {(inputs: Onboarding_Branding_Logo_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PNG, JPEG o SVG. Máximo 512 KB.`)
};

const en_xa2_onboarding_branding_logo_hint = /** @type {(inputs: Onboarding_Branding_Logo_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦PNG, JPÈG, òr SVG. Màx 512 KB. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "PNG, JPEG, or SVG. Max 512 KB." |
*
* @param {Onboarding_Branding_Logo_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_hint = /** @type {((inputs?: Onboarding_Branding_Logo_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Logo_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_logo_hint(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_logo_hint(inputs)
	return en_onboarding_branding_logo_hint(inputs)
});