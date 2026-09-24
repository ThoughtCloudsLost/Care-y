/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Logo_Invalid_TypeInputs */

const en_admin_branding_logo_invalid_type = /** @type {(inputs: Admin_Branding_Logo_Invalid_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only PNG, JPEG, and SVG images are accepted.`)
};

const es_admin_branding_logo_invalid_type = /** @type {(inputs: Admin_Branding_Logo_Invalid_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo se aceptan imágenes PNG, JPEG y SVG.`)
};

const en_xa2_admin_branding_logo_invalid_type = /** @type {(inputs: Admin_Branding_Logo_Invalid_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònly PNG, JPÈG, ànd SVG ìmàgès àrè àccèptèd. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Only PNG, JPEG, and SVG images are accepted." |
*
* @param {Admin_Branding_Logo_Invalid_TypeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_invalid_type = /** @type {((inputs?: Admin_Branding_Logo_Invalid_TypeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Logo_Invalid_TypeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_logo_invalid_type(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_logo_invalid_type(inputs)
	return en_admin_branding_logo_invalid_type(inputs)
});