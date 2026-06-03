/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_SubtextInputs */

const en_onboarding_org_subtext = /** @type {(inputs: Onboarding_Org_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Basic information about your organization.`)
};

const es_onboarding_org_subtext = /** @type {(inputs: Onboarding_Org_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Informacion basica sobre su organizacion.`)
};

/**
* | output |
* | --- |
* | "Basic information about your organization." |
*
* @param {Onboarding_Org_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_subtext = /** @type {((inputs?: Onboarding_Org_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_subtext(inputs)
	return es_onboarding_org_subtext(inputs)
});