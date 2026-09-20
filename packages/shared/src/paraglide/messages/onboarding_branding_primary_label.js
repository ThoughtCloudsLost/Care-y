/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Primary_LabelInputs */

const en_onboarding_branding_primary_label = /** @type {(inputs: Onboarding_Branding_Primary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Primary Color`)
};

const es_onboarding_branding_primary_label = /** @type {(inputs: Onboarding_Branding_Primary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color primario`)
};

const en_xa2_onboarding_branding_primary_label = /** @type {(inputs: Onboarding_Branding_Primary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prìmàry Còlòr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Primary Color" |
*
* @param {Onboarding_Branding_Primary_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_primary_label = /** @type {((inputs?: Onboarding_Branding_Primary_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Primary_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_primary_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_primary_label(inputs)
	return en_onboarding_branding_primary_label(inputs)
});