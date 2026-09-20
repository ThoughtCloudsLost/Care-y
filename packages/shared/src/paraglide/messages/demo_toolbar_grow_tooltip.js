/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Grow_TooltipInputs */

const en_demo_toolbar_grow_tooltip = /** @type {(inputs: Demo_Toolbar_Grow_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restore frame size`)
};

const es_demo_toolbar_grow_tooltip = /** @type {(inputs: Demo_Toolbar_Grow_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restaurar tamaño del marco`)
};

const en_xa2_demo_toolbar_grow_tooltip = /** @type {(inputs: Demo_Toolbar_Grow_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèstòrè fràmè sìzè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Restore frame size" |
*
* @param {Demo_Toolbar_Grow_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_grow_tooltip = /** @type {((inputs?: Demo_Toolbar_Grow_TooltipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Grow_TooltipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_toolbar_grow_tooltip(inputs)
	if (locale === "en-XA") return en_xa2_demo_toolbar_grow_tooltip(inputs)
	return en_demo_toolbar_grow_tooltip(inputs)
});