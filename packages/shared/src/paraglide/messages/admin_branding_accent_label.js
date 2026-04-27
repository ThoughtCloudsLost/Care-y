/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Accent_LabelInputs */

const en_admin_branding_accent_label = /** @type {(inputs: Admin_Branding_Accent_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Accent color`)
};

const es_admin_branding_accent_label = /** @type {(inputs: Admin_Branding_Accent_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color de acento`)
};

/**
* | output |
* | --- |
* | "Accent color" |
*
* @param {Admin_Branding_Accent_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_accent_label = /** @type {((inputs?: Admin_Branding_Accent_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Accent_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_accent_label(inputs)
	return es_admin_branding_accent_label(inputs)
});