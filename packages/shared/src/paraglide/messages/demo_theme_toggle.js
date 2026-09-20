/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Theme_ToggleInputs */

const en_demo_theme_toggle = /** @type {(inputs: Demo_Theme_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toggle dark/light mode`)
};

const es_demo_theme_toggle = /** @type {(inputs: Demo_Theme_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alternar modo claro/oscuro`)
};

const en_xa2_demo_theme_toggle = /** @type {(inputs: Demo_Theme_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tògglè dàrk/lìght mòdè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Toggle dark/light mode" |
*
* @param {Demo_Theme_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_theme_toggle = /** @type {((inputs?: Demo_Theme_ToggleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Theme_ToggleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_theme_toggle(inputs)
	if (locale === "en-XA") return en_xa2_demo_theme_toggle(inputs)
	return en_demo_theme_toggle(inputs)
});