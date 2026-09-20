/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Preview_IconsInputs */

const en_admin_branding_preview_icons = /** @type {(inputs: Admin_Branding_Preview_IconsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Icons`)
};

const es_admin_branding_preview_icons = /** @type {(inputs: Admin_Branding_Preview_IconsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iconos`)
};

const en_xa2_admin_branding_preview_icons = /** @type {(inputs: Admin_Branding_Preview_IconsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìcòns ••⟧`)
};

/**
* | output |
* | --- |
* | "Icons" |
*
* @param {Admin_Branding_Preview_IconsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_preview_icons = /** @type {((inputs?: Admin_Branding_Preview_IconsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Preview_IconsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_preview_icons(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_preview_icons(inputs)
	return en_admin_branding_preview_icons(inputs)
});