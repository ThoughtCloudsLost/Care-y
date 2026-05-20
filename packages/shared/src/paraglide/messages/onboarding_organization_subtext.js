/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Organization_SubtextInputs */

const en_onboarding_organization_subtext = /** @type {(inputs: Onboarding_Organization_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up your organization's identity, branding, terminology, and policies. Only the organization name is required. Everything else can be configured later.`)
};

const es_onboarding_organization_subtext = /** @type {(inputs: Onboarding_Organization_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure la identidad, marca, terminologia y politicas de su organizacion. Solo el nombre es obligatorio. Todo lo demas se puede configurar despues.`)
};

/**
* | output |
* | --- |
* | "Set up your organization's identity, branding, terminology, and policies. Only the organization name is required. Everything else can be configured later." |
*
* @param {Onboarding_Organization_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_organization_subtext = /** @type {((inputs?: Onboarding_Organization_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Organization_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_organization_subtext(inputs)
	return es_onboarding_organization_subtext(inputs)
});