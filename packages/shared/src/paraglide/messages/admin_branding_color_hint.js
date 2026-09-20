/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Color_HintInputs */

const en_admin_branding_color_hint = /** @type {(inputs: Admin_Branding_Color_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Used for buttons and highlights.`)
};

const es_admin_branding_color_hint = /** @type {(inputs: Admin_Branding_Color_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usado para botones y resaltados.`)
};

const en_xa2_admin_branding_color_hint = /** @type {(inputs: Admin_Branding_Color_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèd fòr bùttòns ànd hìghlìghts. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Used for buttons and highlights." |
*
* @param {Admin_Branding_Color_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_hint = /** @type {((inputs?: Admin_Branding_Color_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_color_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_color_hint(inputs)
	return en_admin_branding_color_hint(inputs)
});