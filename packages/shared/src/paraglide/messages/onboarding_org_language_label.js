/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Language_LabelInputs */

const en_onboarding_org_language_label = /** @type {(inputs: Onboarding_Org_Language_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default Language`)
};

const es_onboarding_org_language_label = /** @type {(inputs: Onboarding_Org_Language_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Idioma predeterminado`)
};

/**
* | output |
* | --- |
* | "Default Language" |
*
* @param {Onboarding_Org_Language_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_language_label = /** @type {((inputs?: Onboarding_Org_Language_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Language_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_language_label(inputs)
	return es_onboarding_org_language_label(inputs)
});