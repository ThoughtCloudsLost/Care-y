/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Accent_LabelInputs */

const en_onboarding_branding_accent_label = /** @type {(inputs: Onboarding_Branding_Accent_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Accent Color`)
};

const es_onboarding_branding_accent_label = /** @type {(inputs: Onboarding_Branding_Accent_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color de acento`)
};

/**
* | output |
* | --- |
* | "Accent Color" |
*
* @param {Onboarding_Branding_Accent_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_accent_label = /** @type {((inputs?: Onboarding_Branding_Accent_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Accent_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_accent_label(inputs)
	return es_onboarding_branding_accent_label(inputs)
});