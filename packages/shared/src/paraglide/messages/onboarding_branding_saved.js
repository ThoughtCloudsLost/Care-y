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

/**
* | output |
* | --- |
* | "Branding saved." |
*
* @param {Onboarding_Branding_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_saved = /** @type {((inputs?: Onboarding_Branding_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_saved(inputs)
	return es_onboarding_branding_saved(inputs)
});