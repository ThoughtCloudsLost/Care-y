/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Theme_ToggleInputs */

const en_demo_theme_toggle = /** @type {(inputs: Demo_Theme_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toggle dark mode`)
};

const es_demo_theme_toggle = /** @type {(inputs: Demo_Theme_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alternar modo oscuro`)
};

/**
* | output |
* | --- |
* | "Toggle dark mode" |
*
* @param {Demo_Theme_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_theme_toggle = /** @type {((inputs?: Demo_Theme_ToggleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Theme_ToggleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_theme_toggle(inputs)
	return es_demo_theme_toggle(inputs)
});