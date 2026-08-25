/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Mode_ReadInputs */

const en_demo_mode_read = /** @type {(inputs: Demo_Mode_ReadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Read`)
};

const es_demo_mode_read = /** @type {(inputs: Demo_Mode_ReadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lectura`)
};

/**
* | output |
* | --- |
* | "Read" |
*
* @param {Demo_Mode_ReadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_read = /** @type {((inputs?: Demo_Mode_ReadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Mode_ReadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_mode_read(inputs)
	return es_demo_mode_read(inputs)
});