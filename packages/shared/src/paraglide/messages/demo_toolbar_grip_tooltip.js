/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Grip_TooltipInputs */

const en_demo_toolbar_grip_tooltip = /** @type {(inputs: Demo_Toolbar_Grip_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Drag to reposition`)
};

const es_demo_toolbar_grip_tooltip = /** @type {(inputs: Demo_Toolbar_Grip_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Arrastrar para reposicionar`)
};

/**
* | output |
* | --- |
* | "Drag to reposition" |
*
* @param {Demo_Toolbar_Grip_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_grip_tooltip = /** @type {((inputs?: Demo_Toolbar_Grip_TooltipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Grip_TooltipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_toolbar_grip_tooltip(inputs)
	return es_demo_toolbar_grip_tooltip(inputs)
});