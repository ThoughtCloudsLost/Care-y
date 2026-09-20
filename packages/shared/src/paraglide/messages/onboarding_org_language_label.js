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

const en_xa2_onboarding_org_language_label = /** @type {(inputs: Onboarding_Org_Language_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèfàùlt Làngùàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Default Language" |
*
* @param {Onboarding_Org_Language_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_language_label = /** @type {((inputs?: Onboarding_Org_Language_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Language_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_language_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_language_label(inputs)
	return en_onboarding_org_language_label(inputs)
});