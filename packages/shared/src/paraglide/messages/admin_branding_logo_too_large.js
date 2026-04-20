/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Logo_Too_LargeInputs */

const en_admin_branding_logo_too_large = /** @type {(inputs: Admin_Branding_Logo_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Image must be under 512 KB.`)
};

const es_admin_branding_logo_too_large = /** @type {(inputs: Admin_Branding_Logo_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La imagen debe ser menor a 512 KB.`)
};

/**
* | output |
* | --- |
* | "Image must be under 512 KB." |
*
* @param {Admin_Branding_Logo_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_too_large = /** @type {((inputs?: Admin_Branding_Logo_Too_LargeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Logo_Too_LargeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_logo_too_large(inputs)
	return es_admin_branding_logo_too_large(inputs)
});