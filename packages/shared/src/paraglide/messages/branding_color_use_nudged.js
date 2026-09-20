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

const en_xa2_branding_color_use_nudged = /** @type {(inputs: Branding_Color_Use_NudgedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsè thè sùggèstèd shàdè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Use the suggested shade" |
*
* @param {Branding_Color_Use_NudgedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const branding_color_use_nudged = /** @type {((inputs?: Branding_Color_Use_NudgedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Branding_Color_Use_NudgedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_branding_color_use_nudged(inputs)
	if (locale === "en-XA") return en_xa2_branding_color_use_nudged(inputs)
	return en_branding_color_use_nudged(inputs)
});