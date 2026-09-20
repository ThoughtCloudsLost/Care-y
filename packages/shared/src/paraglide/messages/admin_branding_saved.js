/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_SavedInputs */

const en_admin_branding_saved = /** @type {(inputs: Admin_Branding_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Branding updated`)
};

const es_admin_branding_saved = /** @type {(inputs: Admin_Branding_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marca actualizada`)
};

const en_xa2_admin_branding_saved = /** @type {(inputs: Admin_Branding_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bràndìng ùpdàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Branding updated" |
*
* @param {Admin_Branding_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_saved = /** @type {((inputs?: Admin_Branding_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_saved(inputs)
	return en_admin_branding_saved(inputs)
});