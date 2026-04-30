/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_BrandingInputs */

const en_onboarding_step_branding = /** @type {(inputs: Onboarding_Step_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Branding`)
};

const es_onboarding_step_branding = /** @type {(inputs: Onboarding_Step_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marca`)
};

/**
* | output |
* | --- |
* | "Branding" |
*
* @param {Onboarding_Step_BrandingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_branding = /** @type {((inputs?: Onboarding_Step_BrandingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_BrandingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_step_branding(inputs)
	return es_onboarding_step_branding(inputs)
});