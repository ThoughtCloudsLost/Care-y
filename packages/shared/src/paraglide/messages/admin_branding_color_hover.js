/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Color_HoverInputs */

const en_admin_branding_color_hover = /** @type {(inputs: Admin_Branding_Color_HoverInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hover`)
};

const es_admin_branding_color_hover = /** @type {(inputs: Admin_Branding_Color_HoverInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hover`)
};

const en_xa2_admin_branding_color_hover = /** @type {(inputs: Admin_Branding_Color_HoverInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòvèr ••⟧`)
};

/**
* | output |
* | --- |
* | "Hover" |
*
* @param {Admin_Branding_Color_HoverInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_hover = /** @type {((inputs?: Admin_Branding_Color_HoverInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_HoverInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_color_hover(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_color_hover(inputs)
	return en_admin_branding_color_hover(inputs)
});