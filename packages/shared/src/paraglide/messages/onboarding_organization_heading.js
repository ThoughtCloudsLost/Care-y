/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Organization_HeadingInputs */

const en_onboarding_organization_heading = /** @type {(inputs: Onboarding_Organization_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization`)
};

const es_onboarding_organization_heading = /** @type {(inputs: Onboarding_Organization_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organización`)
};

const en_xa2_onboarding_organization_heading = /** @type {(inputs: Onboarding_Organization_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Onboarding_Organization_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_organization_heading = /** @type {((inputs?: Onboarding_Organization_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Organization_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_organization_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_organization_heading(inputs)
	return en_onboarding_organization_heading(inputs)
});