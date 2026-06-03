/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Terminology_SubtextInputs */

const en_onboarding_org_terminology_subtext = /** @type {(inputs: Onboarding_Org_Terminology_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Customize the terms your organization uses. These defaults work for most orgs.`)
};

const es_onboarding_org_terminology_subtext = /** @type {(inputs: Onboarding_Org_Terminology_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personalice los términos que usa su organización. Los valores predeterminados funcionan para la mayoría.`)
};

/**
* | output |
* | --- |
* | "Customize the terms your organization uses. These defaults work for most orgs." |
*
* @param {Onboarding_Org_Terminology_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_terminology_subtext = /** @type {((inputs?: Onboarding_Org_Terminology_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Terminology_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_terminology_subtext(inputs)
	return es_onboarding_org_terminology_subtext(inputs)
});