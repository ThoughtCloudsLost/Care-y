/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Branding_SubtitleInputs */

const en_hub_branding_subtitle = /** @type {(inputs: Hub_Branding_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization name, colors, and theme`)
};

const es_hub_branding_subtitle = /** @type {(inputs: Hub_Branding_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre, colores y tema de la organizacion`)
};

/**
* | output |
* | --- |
* | "Organization name, colors, and theme" |
*
* @param {Hub_Branding_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_branding_subtitle = /** @type {((inputs?: Hub_Branding_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Branding_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_branding_subtitle(inputs)
	return es_hub_branding_subtitle(inputs)
});