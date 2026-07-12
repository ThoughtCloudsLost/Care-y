/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Branding_Color_Use_NudgedInputs */

const en_branding_color_use_nudged = /** @type {(inputs: Branding_Color_Use_NudgedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use the suggested shade`)
};

const es_branding_color_use_nudged = /** @type {(inputs: Branding_Color_Use_NudgedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usar el tono sugerido`)
};

/**
* | output |
* | --- |
* | "Use the suggested shade" |
*
* @param {Branding_Color_Use_NudgedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const branding_color_use_nudged = /** @type {((inputs?: Branding_Color_Use_NudgedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Branding_Color_Use_NudgedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_branding_color_use_nudged(inputs)
	return es_branding_color_use_nudged(inputs)
});