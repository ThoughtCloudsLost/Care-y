/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ clients: NonNullable<unknown> }} Onboarding_Branding_Text_PlaceholderInputs */

const en_onboarding_branding_text_placeholder = /** @type {(inputs: Onboarding_Branding_Text_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Welcome message shown to ${i?.clients} on the intake page.`)
};

const es_onboarding_branding_text_placeholder = /** @type {(inputs: Onboarding_Branding_Text_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mensaje de bienvenida que se muestra a los ${i?.clients} en la página de admisión.`)
};

const en_xa2_onboarding_branding_text_placeholder = /** @type {(inputs: Onboarding_Branding_Text_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Wèlcòmè mèssàgè shòwn tò  ••••••••${i?.clients} òn thè ìntàkè pàgè. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Welcome message shown to {clients} on the intake page." |
*
* @param {Onboarding_Branding_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_text_placeholder = /** @type {((inputs: Onboarding_Branding_Text_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Branding_Text_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_branding_text_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_branding_text_placeholder(inputs)
	return en_onboarding_branding_text_placeholder(inputs)
});