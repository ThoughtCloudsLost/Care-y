/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Logo_LabelInputs */

const en_onboarding_branding_logo_label = /** @type {(inputs: Onboarding_Branding_Logo_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Logo`)
};

const es_onboarding_branding_logo_label = /** @type {(inputs: Onboarding_Branding_Logo_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Logotipo`)
};

/**
* | output |
* | --- |
* | "Logo" |
*
* @param {Onboarding_Branding_Logo_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_label = /** @type {((inputs?: Onboarding_Branding_Logo_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Logo_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_logo_label(inputs)
	return es_onboarding_branding_logo_label(inputs)
});