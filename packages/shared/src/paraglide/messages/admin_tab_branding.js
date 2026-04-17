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

/**
* | output |
* | --- |
* | "Branding" |
*
* @param {Admin_Tab_BrandingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_branding = /** @type {((inputs?: Admin_Tab_BrandingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_BrandingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_branding(inputs)
	return es_admin_tab_branding(inputs)
});