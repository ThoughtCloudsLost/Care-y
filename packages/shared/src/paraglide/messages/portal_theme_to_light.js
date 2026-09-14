/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Theme_To_LightInputs */

const en_portal_theme_to_light = /** @type {(inputs: Portal_Theme_To_LightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch to light mode`)
};

const es_portal_theme_to_light = /** @type {(inputs: Portal_Theme_To_LightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a modo claro`)
};

/**
* | output |
* | --- |
* | "Switch to light mode" |
*
* @param {Portal_Theme_To_LightInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_theme_to_light = /** @type {((inputs?: Portal_Theme_To_LightInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Theme_To_LightInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_theme_to_light(inputs)
	return en_portal_theme_to_light(inputs)
});