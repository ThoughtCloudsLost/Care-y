/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Logo_AcceptInputs */

const en_admin_branding_logo_accept = /** @type {(inputs: Admin_Branding_Logo_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PNG, JPEG, or SVG. Max 512 KB.`)
};

const es_admin_branding_logo_accept = /** @type {(inputs: Admin_Branding_Logo_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PNG, JPEG o SVG. Maximo 512 KB.`)
};

/**
* | output |
* | --- |
* | "PNG, JPEG, or SVG. Max 512 KB." |
*
* @param {Admin_Branding_Logo_AcceptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_accept = /** @type {((inputs?: Admin_Branding_Logo_AcceptInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Logo_AcceptInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_logo_accept(inputs)
	return es_admin_branding_logo_accept(inputs)
});