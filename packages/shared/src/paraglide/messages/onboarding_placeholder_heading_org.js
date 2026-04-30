/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Placeholder_Heading_OrgInputs */

const en_onboarding_placeholder_heading_org = /** @type {(inputs: Onboarding_Placeholder_Heading_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization Details`)
};

const es_onboarding_placeholder_heading_org = /** @type {(inputs: Onboarding_Placeholder_Heading_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalles de la organizacion`)
};

/**
* | output |
* | --- |
* | "Organization Details" |
*
* @param {Onboarding_Placeholder_Heading_OrgInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_placeholder_heading_org = /** @type {((inputs?: Onboarding_Placeholder_Heading_OrgInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Placeholder_Heading_OrgInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_placeholder_heading_org(inputs)
	return es_onboarding_placeholder_heading_org(inputs)
});