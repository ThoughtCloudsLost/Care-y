/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_BrandingInputs */

const en_admin_tab_branding = /** @type {(inputs: Admin_Tab_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Branding`)
};

const es_admin_tab_branding = /** @type {(inputs: Admin_Tab_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marca`)
};

const en_xa2_admin_tab_branding = /** @type {(inputs: Admin_Tab_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bràndìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Branding" |
*
* @param {Admin_Tab_BrandingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_branding = /** @type {((inputs?: Admin_Tab_BrandingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_BrandingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_branding(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_branding(inputs)
	return en_admin_tab_branding(inputs)
});