/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Logo_Invalid_TypeInputs */

const en_admin_branding_logo_invalid_type = /** @type {(inputs: Admin_Branding_Logo_Invalid_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only PNG, JPEG, and SVG images are accepted.`)
};

const es_admin_branding_logo_invalid_type = /** @type {(inputs: Admin_Branding_Logo_Invalid_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo se aceptan imagenes PNG, JPEG y SVG.`)
};

/**
* | output |
* | --- |
* | "Only PNG, JPEG, and SVG images are accepted." |
*
* @param {Admin_Branding_Logo_Invalid_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_invalid_type = /** @type {((inputs?: Admin_Branding_Logo_Invalid_TypeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Logo_Invalid_TypeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_logo_invalid_type(inputs)
	return es_admin_branding_logo_invalid_type(inputs)
});