/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Card_Color_LabelInputs */

const en_admin_branding_card_color_label = /** @type {(inputs: Admin_Branding_Card_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization colors`)
};

const es_admin_branding_card_color_label = /** @type {(inputs: Admin_Branding_Card_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Colores de la organizacion`)
};

/**
* | output |
* | --- |
* | "Organization colors" |
*
* @param {Admin_Branding_Card_Color_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_color_label = /** @type {((inputs?: Admin_Branding_Card_Color_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Card_Color_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_card_color_label(inputs)
	return es_admin_branding_card_color_label(inputs)
});