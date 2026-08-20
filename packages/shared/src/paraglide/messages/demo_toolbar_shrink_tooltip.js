/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Shrink_TooltipInputs */

const en_demo_toolbar_shrink_tooltip = /** @type {(inputs: Demo_Toolbar_Shrink_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shrink the frame`)
};

const es_demo_toolbar_shrink_tooltip = /** @type {(inputs: Demo_Toolbar_Shrink_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reducir el marco`)
};

/**
* | output |
* | --- |
* | "Shrink the frame" |
*
* @param {Demo_Toolbar_Shrink_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_shrink_tooltip = /** @type {((inputs?: Demo_Toolbar_Shrink_TooltipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Shrink_TooltipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_toolbar_shrink_tooltip(inputs)
	return es_demo_toolbar_shrink_tooltip(inputs)
});