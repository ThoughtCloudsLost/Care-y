/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_SubtextInputs */

const en_onboarding_org_subtext = /** @type {(inputs: Onboarding_Org_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Basic information about your organization.`)
};

const es_onboarding_org_subtext = /** @type {(inputs: Onboarding_Org_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Información básica sobre su organización.`)
};

const en_xa2_onboarding_org_subtext = /** @type {(inputs: Onboarding_Org_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàsìc ìnfòrmàtìòn àbòùt yòùr òrgànìzàtìòn. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Basic information about your organization." |
*
* @param {Onboarding_Org_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_subtext = /** @type {((inputs?: Onboarding_Org_SubtextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_SubtextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_subtext(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_subtext(inputs)
	return en_onboarding_org_subtext(inputs)
});