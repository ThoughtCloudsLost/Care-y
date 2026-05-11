/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_SubmitInputs */

const en_onboarding_branding_submit = /** @type {(inputs: Onboarding_Branding_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save Branding`)
};

const es_onboarding_branding_submit = /** @type {(inputs: Onboarding_Branding_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar marca`)
};

/**
* | output |
* | --- |
* | "Save Branding" |
*
* @param {Onboarding_Branding_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_submit = /** @type {((inputs?: Onboarding_Branding_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_submit(inputs)
	return es_onboarding_branding_submit(inputs)
});