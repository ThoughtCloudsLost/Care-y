/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ color: NonNullable<unknown> }} Admin_Branding_Accent_Swatch_LabelInputs */

const en_admin_branding_accent_swatch_label = /** @type {(inputs: Admin_Branding_Accent_Swatch_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Accent swatch ${i?.color}`)
};

const es_admin_branding_accent_swatch_label = /** @type {(inputs: Admin_Branding_Accent_Swatch_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Muestra de acento ${i?.color}`)
};

/**
* | output |
* | --- |
* | "Accent swatch {color}" |
*
* @param {Admin_Branding_Accent_Swatch_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_accent_swatch_label = /** @type {((inputs: Admin_Branding_Accent_Swatch_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Accent_Swatch_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_accent_swatch_label(inputs)
	return es_admin_branding_accent_swatch_label(inputs)
});