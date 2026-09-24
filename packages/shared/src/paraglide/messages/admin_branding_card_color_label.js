/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Card_Color_LabelInputs */

const en_admin_branding_card_color_label = /** @type {(inputs: Admin_Branding_Card_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization colors`)
};

const es_admin_branding_card_color_label = /** @type {(inputs: Admin_Branding_Card_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Colores de la organización`)
};

const en_xa2_admin_branding_card_color_label = /** @type {(inputs: Admin_Branding_Card_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn còlòrs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization colors" |
*
* @param {Admin_Branding_Card_Color_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_color_label = /** @type {((inputs?: Admin_Branding_Card_Color_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Card_Color_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_card_color_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_card_color_label(inputs)
	return en_admin_branding_card_color_label(inputs)
});