/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Logo_ChooseInputs */

const en_onboarding_branding_logo_choose = /** @type {(inputs: Onboarding_Branding_Logo_ChooseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose file`)
};

const es_onboarding_branding_logo_choose = /** @type {(inputs: Onboarding_Branding_Logo_ChooseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elegir archivo`)
};

/**
* | output |
* | --- |
* | "Choose file" |
*
* @param {Onboarding_Branding_Logo_ChooseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_choose = /** @type {((inputs?: Onboarding_Branding_Logo_ChooseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Logo_ChooseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_logo_choose(inputs)
	return es_onboarding_branding_logo_choose(inputs)
});