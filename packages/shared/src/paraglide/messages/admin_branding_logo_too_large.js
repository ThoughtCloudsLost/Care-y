/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Logo_Too_LargeInputs */

const en_admin_branding_logo_too_large = /** @type {(inputs: Admin_Branding_Logo_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Image could not be compressed to fit. Try a simpler image.`)
};

const es_admin_branding_logo_too_large = /** @type {(inputs: Admin_Branding_Logo_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo comprimir la imagen. Prueba con una imagen más simple.`)
};

const en_xa2_admin_branding_logo_too_large = /** @type {(inputs: Admin_Branding_Logo_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìmàgè còùld nòt bè còmprèssèd tò fìt. Try à sìmplèr ìmàgè. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Image could not be compressed to fit. Try a simpler image." |
*
* @param {Admin_Branding_Logo_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_too_large = /** @type {((inputs?: Admin_Branding_Logo_Too_LargeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Logo_Too_LargeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_logo_too_large(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_logo_too_large(inputs)
	return en_admin_branding_logo_too_large(inputs)
});