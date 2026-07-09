/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Priority_Stamp_LowInputs */

const en_priority_stamp_low = /** @type {(inputs: Priority_Stamp_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Low`)
};

const es_priority_stamp_low = /** @type {(inputs: Priority_Stamp_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Baja`)
};

/**
* | output |
* | --- |
* | "Low" |
*
* @param {Priority_Stamp_LowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_low = /** @type {((inputs?: Priority_Stamp_LowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Priority_Stamp_LowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_priority_stamp_low(inputs)
	return es_priority_stamp_low(inputs)
});