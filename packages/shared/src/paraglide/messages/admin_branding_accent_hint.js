/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Accent_HintInputs */

const en_admin_branding_accent_hint = /** @type {(inputs: Admin_Branding_Accent_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Used for icons, badges, and secondary highlights.`)
};

const es_admin_branding_accent_hint = /** @type {(inputs: Admin_Branding_Accent_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usado para iconos, insignias y resaltados secundarios.`)
};

/**
* | output |
* | --- |
* | "Used for icons, badges, and secondary highlights." |
*
* @param {Admin_Branding_Accent_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_accent_hint = /** @type {((inputs?: Admin_Branding_Accent_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Accent_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_accent_hint(inputs)
	return es_admin_branding_accent_hint(inputs)
});