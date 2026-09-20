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

const en_xa2_admin_branding_color_accent = /** @type {(inputs: Admin_Branding_Color_AccentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccènt ••⟧`)
};

/**
* | output |
* | --- |
* | "Accent" |
*
* @param {Admin_Branding_Color_AccentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_accent = /** @type {((inputs?: Admin_Branding_Color_AccentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_AccentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_color_accent(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_color_accent(inputs)
	return en_admin_branding_color_accent(inputs)
});