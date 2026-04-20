/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Color_AccentInputs */

const en_admin_branding_color_accent = /** @type {(inputs: Admin_Branding_Color_AccentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Accent`)
};

const es_admin_branding_color_accent = /** @type {(inputs: Admin_Branding_Color_AccentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acento`)
};

/**
* | output |
* | --- |
* | "Accent" |
*
* @param {Admin_Branding_Color_AccentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_accent = /** @type {((inputs?: Admin_Branding_Color_AccentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_AccentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_color_accent(inputs)
	return es_admin_branding_color_accent(inputs)
});