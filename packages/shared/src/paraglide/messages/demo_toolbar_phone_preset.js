/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Phone_PresetInputs */

const en_demo_toolbar_phone_preset = /** @type {(inputs: Demo_Toolbar_Phone_PresetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone size`)
};

const es_demo_toolbar_phone_preset = /** @type {(inputs: Demo_Toolbar_Phone_PresetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tamaño de teléfono`)
};

const en_xa2_demo_toolbar_phone_preset = /** @type {(inputs: Demo_Toolbar_Phone_PresetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè sìzè •••⟧`)
};

/**
* | output |
* | --- |
* | "Phone size" |
*
* @param {Demo_Toolbar_Phone_PresetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_phone_preset = /** @type {((inputs?: Demo_Toolbar_Phone_PresetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Phone_PresetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_toolbar_phone_preset(inputs)
	if (locale === "en-XA") return en_xa2_demo_toolbar_phone_preset(inputs)
	return en_demo_toolbar_phone_preset(inputs)
});