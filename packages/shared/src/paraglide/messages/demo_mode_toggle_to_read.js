/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Mode_Toggle_To_ReadInputs */

const en_demo_mode_toggle_to_read = /** @type {(inputs: Demo_Mode_Toggle_To_ReadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch to read mode`)
};

const es_demo_mode_toggle_to_read = /** @type {(inputs: Demo_Mode_Toggle_To_ReadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a modo lectura`)
};

/**
* | output |
* | --- |
* | "Switch to read mode" |
*
* @param {Demo_Mode_Toggle_To_ReadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_toggle_to_read = /** @type {((inputs?: Demo_Mode_Toggle_To_ReadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Mode_Toggle_To_ReadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_mode_toggle_to_read(inputs)
	return es_demo_mode_toggle_to_read(inputs)
});