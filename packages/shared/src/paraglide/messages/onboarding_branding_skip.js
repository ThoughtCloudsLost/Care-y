/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_SkipInputs */

const en_onboarding_branding_skip = /** @type {(inputs: Onboarding_Branding_SkipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skip for now`)
};

const es_onboarding_branding_skip = /** @type {(inputs: Onboarding_Branding_SkipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Omitir por ahora`)
};

/**
* | output |
* | --- |
* | "Skip for now" |
*
* @param {Onboarding_Branding_SkipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_skip = /** @type {((inputs?: Onboarding_Branding_SkipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_SkipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_skip(inputs)
	return es_onboarding_branding_skip(inputs)
});