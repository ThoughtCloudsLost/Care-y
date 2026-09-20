/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Color_PrimaryInputs */

const en_admin_branding_color_primary = /** @type {(inputs: Admin_Branding_Color_PrimaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Primary`)
};

const es_admin_branding_color_primary = /** @type {(inputs: Admin_Branding_Color_PrimaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Primario`)
};

const en_xa2_admin_branding_color_primary = /** @type {(inputs: Admin_Branding_Color_PrimaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prìmàry •••⟧`)
};

/**
* | output |
* | --- |
* | "Primary" |
*
* @param {Admin_Branding_Color_PrimaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_primary = /** @type {((inputs?: Admin_Branding_Color_PrimaryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_PrimaryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_color_primary(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_color_primary(inputs)
	return en_admin_branding_color_primary(inputs)
});