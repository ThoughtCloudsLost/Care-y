/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, clients: NonNullable<unknown> }} Onboarding_Branding_Text_LabelInputs */

const en_onboarding_branding_text_label = /** @type {(inputs: Onboarding_Branding_Text_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client}-Facing Greeting`)
};

const es_onboarding_branding_text_label = /** @type {(inputs: Onboarding_Branding_Text_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Saludo para ${i?.clients}`)
};

const en_xa2_onboarding_branding_text_label = /** @type {(inputs: Onboarding_Branding_Text_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client}-Fàcìng Grèètìng •••••⟧`)
};

/**
* | output |
* | --- |
* | "{Client}-Facing Greeting" |
*
* @param {Onboarding_Branding_Text_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_text_label = /** @type {((inputs: Onboarding_Branding_Text_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Text_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_text_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_text_label(inputs)
	return en_onboarding_branding_text_label(inputs)
});