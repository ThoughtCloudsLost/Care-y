/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Language_EnInputs */

const en_onboarding_org_language_en = /** @type {(inputs: Onboarding_Org_Language_EnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`English`)
};

const es_onboarding_org_language_en = /** @type {(inputs: Onboarding_Org_Language_EnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inglés`)
};

const en_xa2_onboarding_org_language_en = /** @type {(inputs: Onboarding_Org_Language_EnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ènglìsh •••⟧`)
};

/**
* | output |
* | --- |
* | "English" |
*
* @param {Onboarding_Org_Language_EnInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_language_en = /** @type {((inputs?: Onboarding_Org_Language_EnInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Language_EnInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_language_en(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_language_en(inputs)
	return en_onboarding_org_language_en(inputs)
});