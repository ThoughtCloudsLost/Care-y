/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Tickets_DescrambleInputs */

const en_demo_tickets_descramble = /** @type {(inputs: Demo_Tickets_DescrambleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decrypting ticket titles`)
};

const es_demo_tickets_descramble = /** @type {(inputs: Demo_Tickets_DescrambleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descifrando títulos de tickets`)
};

/**
* | output |
* | --- |
* | "Decrypting ticket titles" |
*
* @param {Demo_Tickets_DescrambleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_descramble = /** @type {((inputs?: Demo_Tickets_DescrambleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_DescrambleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_tickets_descramble(inputs)
	return es_demo_tickets_descramble(inputs)
});