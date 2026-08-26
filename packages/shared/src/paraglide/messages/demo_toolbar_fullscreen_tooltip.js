/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Fullscreen_TooltipInputs */

const en_demo_toolbar_fullscreen_tooltip = /** @type {(inputs: Demo_Toolbar_Fullscreen_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Full screen`)
};

const es_demo_toolbar_fullscreen_tooltip = /** @type {(inputs: Demo_Toolbar_Fullscreen_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pantalla completa`)
};

/**
* | output |
* | --- |
* | "Full screen" |
*
* @param {Demo_Toolbar_Fullscreen_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_fullscreen_tooltip = /** @type {((inputs?: Demo_Toolbar_Fullscreen_TooltipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Fullscreen_TooltipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_toolbar_fullscreen_tooltip(inputs)
	return es_demo_toolbar_fullscreen_tooltip(inputs)
});