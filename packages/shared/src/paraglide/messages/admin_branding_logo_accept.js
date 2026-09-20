/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Logo_AcceptInputs */

const en_admin_branding_logo_accept = /** @type {(inputs: Admin_Branding_Logo_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PNG, JPEG, or SVG. Resized to 512px automatically.`)
};

const es_admin_branding_logo_accept = /** @type {(inputs: Admin_Branding_Logo_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PNG, JPEG o SVG. Se redimensiona a 512px automáticamente.`)
};

const en_xa2_admin_branding_logo_accept = /** @type {(inputs: Admin_Branding_Logo_AcceptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦PNG, JPÈG, òr SVG. Rèsìzèd tò 512px àùtòmàtìcàlly. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "PNG, JPEG, or SVG. Resized to 512px automatically." |
*
* @param {Admin_Branding_Logo_AcceptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_accept = /** @type {((inputs?: Admin_Branding_Logo_AcceptInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Logo_AcceptInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_logo_accept(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_logo_accept(inputs)
	return en_admin_branding_logo_accept(inputs)
});