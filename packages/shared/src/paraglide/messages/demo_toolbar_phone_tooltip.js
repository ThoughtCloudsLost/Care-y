/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Phone_TooltipInputs */

const en_demo_toolbar_phone_tooltip = /** @type {(inputs: Demo_Toolbar_Phone_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch to phone layout (390 x 844)`)
};

const es_demo_toolbar_phone_tooltip = /** @type {(inputs: Demo_Toolbar_Phone_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a vista de teléfono (390 x 844)`)
};

const en_xa2_demo_toolbar_phone_tooltip = /** @type {(inputs: Demo_Toolbar_Phone_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Swìtch tò phònè làyòùt (390 x 844) •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Switch to phone layout (390 x 844)" |
*
* @param {Demo_Toolbar_Phone_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_phone_tooltip = /** @type {((inputs?: Demo_Toolbar_Phone_TooltipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Phone_TooltipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_toolbar_phone_tooltip(inputs)
	if (locale === "en-XA") return en_xa2_demo_toolbar_phone_tooltip(inputs)
	return en_demo_toolbar_phone_tooltip(inputs)
});