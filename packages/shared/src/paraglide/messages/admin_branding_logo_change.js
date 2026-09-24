/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Logo_ChangeInputs */

const en_admin_branding_logo_change = /** @type {(inputs: Admin_Branding_Logo_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change logo`)
};

const es_admin_branding_logo_change = /** @type {(inputs: Admin_Branding_Logo_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar logotipo`)
};

const en_xa2_admin_branding_logo_change = /** @type {(inputs: Admin_Branding_Logo_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngè lògò ••••⟧`)
};

/**
* | output |
* | --- |
* | "Change logo" |
*
* @param {Admin_Branding_Logo_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_change = /** @type {((inputs?: Admin_Branding_Logo_ChangeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Logo_ChangeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_logo_change(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_logo_change(inputs)
	return en_admin_branding_logo_change(inputs)
});