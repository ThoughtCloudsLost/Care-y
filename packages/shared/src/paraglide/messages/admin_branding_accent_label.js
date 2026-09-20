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

const en_xa2_admin_branding_accent_label = /** @type {(inputs: Admin_Branding_Accent_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccènt còlòr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Accent color" |
*
* @param {Admin_Branding_Accent_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_accent_label = /** @type {((inputs?: Admin_Branding_Accent_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Accent_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_accent_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_accent_label(inputs)
	return en_admin_branding_accent_label(inputs)
});