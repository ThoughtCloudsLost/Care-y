/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Branding_Logo_Preview_AltInputs */

const en_onboarding_branding_logo_preview_alt = /** @type {(inputs: Onboarding_Branding_Logo_Preview_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Logo preview`)
};

const es_onboarding_branding_logo_preview_alt = /** @type {(inputs: Onboarding_Branding_Logo_Preview_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista previa del logotipo`)
};

const en_xa2_onboarding_branding_logo_preview_alt = /** @type {(inputs: Onboarding_Branding_Logo_Preview_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lògò prèvìèw ••••⟧`)
};

/**
* | output |
* | --- |
* | "Logo preview" |
*
* @param {Onboarding_Branding_Logo_Preview_AltInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_preview_alt = /** @type {((inputs?: Onboarding_Branding_Logo_Preview_AltInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Logo_Preview_AltInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_logo_preview_alt(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_logo_preview_alt(inputs)
	return en_onboarding_branding_logo_preview_alt(inputs)
});