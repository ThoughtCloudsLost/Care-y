/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Terminology_HeadingInputs */

const en_onboarding_org_terminology_heading = /** @type {(inputs: Onboarding_Org_Terminology_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminology`)
};

const es_onboarding_org_terminology_heading = /** @type {(inputs: Onboarding_Org_Terminology_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminología`)
};

const en_xa2_onboarding_org_terminology_heading = /** @type {(inputs: Onboarding_Org_Terminology_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèrmìnòlògy ••••⟧`)
};

/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Onboarding_Org_Terminology_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_terminology_heading = /** @type {((inputs?: Onboarding_Org_Terminology_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Terminology_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_terminology_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_terminology_heading(inputs)
	return en_onboarding_org_terminology_heading(inputs)
});