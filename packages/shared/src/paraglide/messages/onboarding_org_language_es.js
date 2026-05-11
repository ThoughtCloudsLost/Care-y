/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Language_EsInputs */

const en_onboarding_org_language_es = /** @type {(inputs: Onboarding_Org_Language_EsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Spanish`)
};

const es_onboarding_org_language_es = /** @type {(inputs: Onboarding_Org_Language_EsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Espanol`)
};

/**
* | output |
* | --- |
* | "Spanish" |
*
* @param {Onboarding_Org_Language_EsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_language_es = /** @type {((inputs?: Onboarding_Org_Language_EsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Language_EsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_language_es(inputs)
	return es_onboarding_org_language_es(inputs)
});