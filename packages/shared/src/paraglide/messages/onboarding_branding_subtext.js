/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown>, clients: NonNullable<unknown> }} Onboarding_Branding_SubtextInputs */

const en_onboarding_branding_subtext = /** @type {(inputs: Onboarding_Branding_SubtextInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Customize how your organization appears to ${i?.volunteers} and ${i?.clients}. You can change these later.`)
};

const es_onboarding_branding_subtext = /** @type {(inputs: Onboarding_Branding_SubtextInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Personalice como aparece su organizacion ante ${i?.volunteers} y ${i?.clients}. Puede cambiarlo despues.`)
};

/**
* | output |
* | --- |
* | "Customize how your organization appears to {volunteers} and {clients}. You can change these later." |
*
* @param {Onboarding_Branding_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_subtext = /** @type {((inputs: Onboarding_Branding_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_branding_subtext(inputs)
	return es_onboarding_branding_subtext(inputs)
});