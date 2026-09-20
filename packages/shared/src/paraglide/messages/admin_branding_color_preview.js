/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Color_PreviewInputs */

const en_admin_branding_color_preview = /** @type {(inputs: Admin_Branding_Color_PreviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preview`)
};

const es_admin_branding_color_preview = /** @type {(inputs: Admin_Branding_Color_PreviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista previa`)
};

const en_xa2_admin_branding_color_preview = /** @type {(inputs: Admin_Branding_Color_PreviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prèvìèw •••⟧`)
};

/**
* | output |
* | --- |
* | "Preview" |
*
* @param {Admin_Branding_Color_PreviewInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_preview = /** @type {((inputs?: Admin_Branding_Color_PreviewInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_PreviewInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_color_preview(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_color_preview(inputs)
	return en_admin_branding_color_preview(inputs)
});