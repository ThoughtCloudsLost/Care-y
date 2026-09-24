/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_BrandingInputs */

const en_panel_branding = /** @type {(inputs: Panel_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Branding`)
};

const es_panel_branding = /** @type {(inputs: Panel_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marca`)
};

const en_xa2_panel_branding = /** @type {(inputs: Panel_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bràndìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Branding" |
*
* @param {Panel_BrandingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_branding = /** @type {((inputs?: Panel_BrandingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_BrandingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_branding(inputs)
	if (locale === "en-XA") return en_xa2_panel_branding(inputs)
	return en_panel_branding(inputs)
});