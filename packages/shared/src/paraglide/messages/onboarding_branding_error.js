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

/**
* | output |
* | --- |
* | "Failed to save branding." |
*
* @param {Onboarding_Branding_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_error = /** @type {((inputs?: Onboarding_Branding_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_error(inputs)
	return es_onboarding_branding_error(inputs)
});