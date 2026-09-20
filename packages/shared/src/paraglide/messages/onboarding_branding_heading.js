/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_HeadingInputs */

const en_onboarding_branding_heading = /** @type {(inputs: Onboarding_Branding_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Branding`)
};

const es_onboarding_branding_heading = /** @type {(inputs: Onboarding_Branding_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marca`)
};

const en_xa2_onboarding_branding_heading = /** @type {(inputs: Onboarding_Branding_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bràndìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Branding" |
*
* @param {Onboarding_Branding_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_heading = /** @type {((inputs?: Onboarding_Branding_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_heading(inputs)
	return en_onboarding_branding_heading(inputs)
});