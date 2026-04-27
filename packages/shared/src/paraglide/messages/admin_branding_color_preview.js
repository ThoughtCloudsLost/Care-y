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

/**
* | output |
* | --- |
* | "Preview" |
*
* @param {Admin_Branding_Color_PreviewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_preview = /** @type {((inputs?: Admin_Branding_Color_PreviewInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_PreviewInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_color_preview(inputs)
	return es_admin_branding_color_preview(inputs)
});