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

const en_xa2_onboarding_org_terminology_subtext = /** @type {(inputs: Onboarding_Org_Terminology_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùstòmìzè thè tèrms yòùr òrgànìzàtìòn ùsès. Thèsè dèfàùlts wòrk fòr mòst òrgs. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Customize the terms your organization uses. These defaults work for most orgs." |
*
* @param {Onboarding_Org_Terminology_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_terminology_subtext = /** @type {((inputs?: Onboarding_Org_Terminology_SubtextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Terminology_SubtextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_terminology_subtext(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_terminology_subtext(inputs)
	return en_onboarding_org_terminology_subtext(inputs)
});