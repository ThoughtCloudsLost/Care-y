/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Logo_HintInputs */

const en_onboarding_branding_logo_hint = /** @type {(inputs: Onboarding_Branding_Logo_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PNG, JPEG, or SVG. Max 512 KB.`)
};

const es_onboarding_branding_logo_hint = /** @type {(inputs: Onboarding_Branding_Logo_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PNG, JPEG o SVG. Maximo 512 KB.`)
};

/**
* | output |
* | --- |
* | "PNG, JPEG, or SVG. Max 512 KB." |
*
* @param {Onboarding_Branding_Logo_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_hint = /** @type {((inputs?: Onboarding_Branding_Logo_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Logo_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_logo_hint(inputs)
	return es_onboarding_branding_logo_hint(inputs)
});