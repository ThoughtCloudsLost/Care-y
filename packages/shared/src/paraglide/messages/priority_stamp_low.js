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

const en_xa2_priority_stamp_low = /** @type {(inputs: Priority_Stamp_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòw •⟧`)
};

/**
* | output |
* | --- |
* | "Low" |
*
* @param {Priority_Stamp_LowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_low = /** @type {((inputs?: Priority_Stamp_LowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Priority_Stamp_LowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_priority_stamp_low(inputs)
	if (locale === "en-XA") return en_xa2_priority_stamp_low(inputs)
	return en_priority_stamp_low(inputs)
});