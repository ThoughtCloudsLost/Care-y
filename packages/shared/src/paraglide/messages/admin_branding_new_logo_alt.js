/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_New_Logo_AltInputs */

const en_admin_branding_new_logo_alt = /** @type {(inputs: Admin_Branding_New_Logo_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New logo preview`)
};

const es_admin_branding_new_logo_alt = /** @type {(inputs: Admin_Branding_New_Logo_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista previa del nuevo logotipo`)
};

/**
* | output |
* | --- |
* | "New logo preview" |
*
* @param {Admin_Branding_New_Logo_AltInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_new_logo_alt = /** @type {((inputs?: Admin_Branding_New_Logo_AltInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_New_Logo_AltInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_new_logo_alt(inputs)
	return es_admin_branding_new_logo_alt(inputs)
});