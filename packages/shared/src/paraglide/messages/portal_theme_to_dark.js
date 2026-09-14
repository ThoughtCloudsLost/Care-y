/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Theme_To_DarkInputs */

const en_portal_theme_to_dark = /** @type {(inputs: Portal_Theme_To_DarkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch to dark mode`)
};

const es_portal_theme_to_dark = /** @type {(inputs: Portal_Theme_To_DarkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a modo oscuro`)
};

/**
* | output |
* | --- |
* | "Switch to dark mode" |
*
* @param {Portal_Theme_To_DarkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_theme_to_dark = /** @type {((inputs?: Portal_Theme_To_DarkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Theme_To_DarkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_theme_to_dark(inputs)
	return en_portal_theme_to_dark(inputs)
});