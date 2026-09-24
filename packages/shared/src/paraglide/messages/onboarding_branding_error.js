/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_ErrorInputs */

const en_onboarding_branding_error = /** @type {(inputs: Onboarding_Branding_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to save branding.`)
};

const es_onboarding_branding_error = /** @type {(inputs: Onboarding_Branding_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo guardar la marca.`)
};

const en_xa2_onboarding_branding_error = /** @type {(inputs: Onboarding_Branding_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fàìlèd tò sàvè bràndìng. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Failed to save branding." |
*
* @param {Onboarding_Branding_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_error = /** @type {((inputs?: Onboarding_Branding_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_error(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_error(inputs)
	return en_onboarding_branding_error(inputs)
});