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

const en_xa2_demo_toolbar_close_tooltip = /** @type {(inputs: Demo_Toolbar_Close_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsè thè CÀRÈ-Y sìmùlàtòr (rèàdìng mòdè) •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Close the CARE-Y simulator (reading mode)" |
*
* @param {Demo_Toolbar_Close_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_close_tooltip = /** @type {((inputs?: Demo_Toolbar_Close_TooltipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Close_TooltipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_toolbar_close_tooltip(inputs)
	if (locale === "en-XA") return en_xa2_demo_toolbar_close_tooltip(inputs)
	return en_demo_toolbar_close_tooltip(inputs)
});