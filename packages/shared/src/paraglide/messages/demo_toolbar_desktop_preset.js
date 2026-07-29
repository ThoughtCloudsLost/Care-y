/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Desktop_PresetInputs */

const en_demo_toolbar_desktop_preset = /** @type {(inputs: Demo_Toolbar_Desktop_PresetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desktop size`)
};

const es_demo_toolbar_desktop_preset = /** @type {(inputs: Demo_Toolbar_Desktop_PresetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tamano de escritorio`)
};

/**
* | output |
* | --- |
* | "Desktop size" |
*
* @param {Demo_Toolbar_Desktop_PresetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_desktop_preset = /** @type {((inputs?: Demo_Toolbar_Desktop_PresetInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Desktop_PresetInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_toolbar_desktop_preset(inputs)
	return es_demo_toolbar_desktop_preset(inputs)
});