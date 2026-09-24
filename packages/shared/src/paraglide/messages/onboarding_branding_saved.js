/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_SavedInputs */

const en_onboarding_branding_saved = /** @type {(inputs: Onboarding_Branding_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Branding saved.`)
};

const es_onboarding_branding_saved = /** @type {(inputs: Onboarding_Branding_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marca guardada.`)
};

const en_xa2_onboarding_branding_saved = /** @type {(inputs: Onboarding_Branding_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bràndìng sàvèd. •••••⟧`)
};

/**
* | output |
* | --- |
* | "Branding saved." |
*
* @param {Onboarding_Branding_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_saved = /** @type {((inputs?: Onboarding_Branding_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_saved(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_saved(inputs)
	return en_onboarding_branding_saved(inputs)
});