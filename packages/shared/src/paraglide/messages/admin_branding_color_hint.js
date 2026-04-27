/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Color_HintInputs */

const en_admin_branding_color_hint = /** @type {(inputs: Admin_Branding_Color_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Used for buttons and highlights.`)
};

const es_admin_branding_color_hint = /** @type {(inputs: Admin_Branding_Color_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usado para botones y resaltados.`)
};

/**
* | output |
* | --- |
* | "Used for buttons and highlights." |
*
* @param {Admin_Branding_Color_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_hint = /** @type {((inputs?: Admin_Branding_Color_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_color_hint(inputs)
	return es_admin_branding_color_hint(inputs)
});