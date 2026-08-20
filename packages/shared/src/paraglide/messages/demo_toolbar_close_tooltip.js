/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Close_TooltipInputs */

const en_demo_toolbar_close_tooltip = /** @type {(inputs: Demo_Toolbar_Close_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close the CARE-Y simulator (reading mode)`)
};

const es_demo_toolbar_close_tooltip = /** @type {(inputs: Demo_Toolbar_Close_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar el simulador CARE-Y (modo lectura)`)
};

/**
* | output |
* | --- |
* | "Close the CARE-Y simulator (reading mode)" |
*
* @param {Demo_Toolbar_Close_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_close_tooltip = /** @type {((inputs?: Demo_Toolbar_Close_TooltipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Close_TooltipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_toolbar_close_tooltip(inputs)
	return es_demo_toolbar_close_tooltip(inputs)
});