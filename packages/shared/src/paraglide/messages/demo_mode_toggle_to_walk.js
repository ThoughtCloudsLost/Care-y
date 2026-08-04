/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Mode_Toggle_To_WalkInputs */

const en_demo_mode_toggle_to_walk = /** @type {(inputs: Demo_Mode_Toggle_To_WalkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch to walkthrough mode`)
};

const es_demo_mode_toggle_to_walk = /** @type {(inputs: Demo_Mode_Toggle_To_WalkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a modo recorrido`)
};

/**
* | output |
* | --- |
* | "Switch to walkthrough mode" |
*
* @param {Demo_Mode_Toggle_To_WalkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_toggle_to_walk = /** @type {((inputs?: Demo_Mode_Toggle_To_WalkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Mode_Toggle_To_WalkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_mode_toggle_to_walk(inputs)
	return es_demo_mode_toggle_to_walk(inputs)
});