/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Priority_LowInputs */

const en_ticket_new_priority_low = /** @type {(inputs: Ticket_New_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Low`)
};

const es_ticket_new_priority_low = /** @type {(inputs: Ticket_New_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Baja`)
};

const en_xa2_ticket_new_priority_low = /** @type {(inputs: Ticket_New_Priority_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòw •⟧`)
};

/**
* | output |
* | --- |
* | "Low" |
*
* @param {Ticket_New_Priority_LowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_priority_low = /** @type {((inputs?: Ticket_New_Priority_LowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Priority_LowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_priority_low(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_priority_low(inputs)
	return en_ticket_new_priority_low(inputs)
});