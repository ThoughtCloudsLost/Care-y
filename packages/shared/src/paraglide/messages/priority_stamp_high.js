/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Priority_Stamp_HighInputs */

const en_priority_stamp_high = /** @type {(inputs: Priority_Stamp_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High`)
};

const es_priority_stamp_high = /** @type {(inputs: Priority_Stamp_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alta`)
};

const en_xa2_priority_stamp_high = /** @type {(inputs: Priority_Stamp_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hìgh ••⟧`)
};

/**
* | output |
* | --- |
* | "High" |
*
* @param {Priority_Stamp_HighInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_high = /** @type {((inputs?: Priority_Stamp_HighInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Priority_Stamp_HighInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_priority_stamp_high(inputs)
	if (locale === "en-XA") return en_xa2_priority_stamp_high(inputs)
	return en_priority_stamp_high(inputs)
});