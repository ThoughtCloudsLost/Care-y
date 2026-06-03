/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Organization_HeadingInputs */

const en_onboarding_organization_heading = /** @type {(inputs: Onboarding_Organization_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization`)
};

const es_onboarding_organization_heading = /** @type {(inputs: Onboarding_Organization_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organizacion`)
};

/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Onboarding_Organization_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_organization_heading = /** @type {((inputs?: Onboarding_Organization_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Organization_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_organization_heading(inputs)
	return es_onboarding_organization_heading(inputs)
});