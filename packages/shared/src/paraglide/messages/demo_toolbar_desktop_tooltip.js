/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Desktop_TooltipInputs */

const en_demo_toolbar_desktop_tooltip = /** @type {(inputs: Demo_Toolbar_Desktop_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch to desktop layout (760 x 475)`)
};

const es_demo_toolbar_desktop_tooltip = /** @type {(inputs: Demo_Toolbar_Desktop_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a vista de escritorio (760 x 475)`)
};

const en_xa2_demo_toolbar_desktop_tooltip = /** @type {(inputs: Demo_Toolbar_Desktop_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Swìtch tò dèsktòp làyòùt (760 x 475) •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Switch to desktop layout (760 x 475)" |
*
* @param {Demo_Toolbar_Desktop_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_desktop_tooltip = /** @type {((inputs?: Demo_Toolbar_Desktop_TooltipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Desktop_TooltipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_toolbar_desktop_tooltip(inputs)
	if (locale === "en-XA") return en_xa2_demo_toolbar_desktop_tooltip(inputs)
	return en_demo_toolbar_desktop_tooltip(inputs)
});